import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  Suspense,
} from "react";
import {
  Mic, MicOff, Video, VideoOff,
  PhoneOff, Pencil, Monitor, MonitorOff,
} from "lucide-react";
import { useSelector } from "react-redux";
import AgoraRTC from "agora-rtc-sdk-ng";
import { DEFAULT_PIC, BASE_URL } from "../../utils/constant";

const Whiteboard = React.lazy(() => import("./Whiteboard"));

const VideoCall = ({ targetUser, onClose, isCaller, socketRef }) => {
  const user = useSelector((s) => s.user);
  if (!user || !targetUser) return null;
  return (
    <VideoCallInner
      user={user}
      targetUser={targetUser}
      onClose={onClose}
      isCaller={isCaller}
      socketRef={socketRef}
    />
  );
};

const VideoCallInner = ({ user, targetUser, onClose, isCaller, socketRef }) => {
  const [remoteActive, setRemoteActive]       = useState(false);
  const [micOn, setMicOn]                     = useState(true);
  const [cameraOn, setCameraOn]               = useState(true);
  const [showWhiteboard, setShowWhiteboard]   = useState(false);
  const [agoraReady, setAgoraReady]           = useState(false);
  const [permError, setPermError]             = useState(null);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  // true = someone is sharing (local or remote)
  const [screenActive, setScreenActive]       = useState(false);
  // uid of the remote screen-share track (so we can skip camera subscribe)
  const remoteScreenUidRef = useRef(null);

  const clientRef            = useRef(null);
  const localVideoTrackRef   = useRef(null);
  const localAudioTrackRef   = useRef(null);
  const localScreenTrackRef  = useRef(null); // screen share track
  const remoteVideoTrackRef  = useRef(null);
  const remoteScreenTrackRef = useRef(null);
  const showWBRef            = useRef(false);

  useEffect(() => { showWBRef.current = showWhiteboard; }, [showWhiteboard]);

  const channelName  = [user._id, targetUser._id].sort().join("_");
  const localUidNum  = (parseInt(user._id.slice(-8), 16) % 100000) + 1;
  // Screen share uses a different UID so Agora treats it as a separate publisher
  const screenUidNum = localUidNum + 100000;

  // ── helpers ─────────────────────────────────────────────────────────────
  const playInto = useCallback((track, divId) => {
    if (!track) return;
    const el = document.getElementById(divId);
    if (!el) { console.error(`div#${divId} NOT FOUND`); return; }
    try { track.stop(); track.play(divId); } catch (e) { console.error(e); }
  }, []);

  const reattachAll = useCallback(() => {
    const isBoard = showWBRef.current;
    // If screen is being shared locally, don't reattach camera to main view
    if (!isSharingScreen) {
      playInto(localVideoTrackRef.current,  isBoard ? "vc-local-board"  : "vc-local-normal");
    }
    playInto(remoteVideoTrackRef.current,   isBoard ? "vc-remote-board" : "vc-remote-normal");
  }, [playInto, isSharingScreen]);

  // ── Agora init ───────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        if (isCaller) {
          socketRef.current?.emit("video-call:start", { to: targetUser._id });
        }

        const res = await fetch(
          `${BASE_URL}/api/agora-token?channelName=${channelName}&uid=${localUidNum}`
        );
        const { token, appId } = await res.json();

        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        clientRef.current = client;

        const localUid = await client.join(appId, channelName, token, localUidNum);
        console.log("[VideoCall] joined uid:", localUid);

        client.on("user-published", async (remoteUser, mediaType) => {
          if (remoteUser.uid === localUid || remoteUser.uid === screenUidNum) return;

          await client.subscribe(remoteUser, mediaType);

          if (mediaType === "video") {
            // Detect if this is a screen-share track
            // Agora screen-share UIDs are typically offset — check videoTrackLabel
            const isScreen =
              remoteUser.videoTrack?._mediaStreamTrack?.label
                ?.toLowerCase()
                .includes("screen") ||
              String(remoteUser.uid).endsWith("00000"); // our screenUidNum pattern

            if (isScreen) {
              remoteScreenTrackRef.current = remoteUser.videoTrack;
              remoteScreenUidRef.current   = remoteUser.uid;
              setScreenActive(true);
              setTimeout(() => playInto(remoteUser.videoTrack, "vc-screen-main"), 80);
            } else {
              remoteVideoTrackRef.current = remoteUser.videoTrack;
              const id = showWBRef.current ? "vc-remote-board" : "vc-remote-normal";
              remoteUser.videoTrack.play(id);
              setRemoteActive(true);
            }
          }
          if (mediaType === "audio") remoteUser.audioTrack.play();
        });

        client.on("user-unpublished", (remoteUser, mediaType) => {
          if (mediaType === "video") {
            if (remoteUser.uid === remoteScreenUidRef.current) {
              remoteScreenTrackRef.current = null;
              remoteScreenUidRef.current   = null;
              setScreenActive(false);
            } else {
              remoteVideoTrackRef.current = null;
              setRemoteActive(false);
            }
          }
        });

        let audioTrack, videoTrack;
        try {
          [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        } catch (err) {
          setPermError(JSON.stringify({ name: err?.name, code: err?.code, message: err?.message }));
          return;
        }
        localAudioTrackRef.current = audioTrack;
        localVideoTrackRef.current = videoTrack;
        await client.publish([audioTrack, videoTrack]);
        setAgoraReady(true);
      } catch (err) {
        console.error("Agora init error:", err);
      }
    };

    init();
    return () => {
      localVideoTrackRef.current?.stop();
      localVideoTrackRef.current?.close();
      localAudioTrackRef.current?.close();
      localScreenTrackRef.current?.stop();
      localScreenTrackRef.current?.close();
      clientRef.current?.leave();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── play local video after DOM ready ────────────────────────────────────
  useEffect(() => {
    if (!agoraReady) return;
    const raf = requestAnimationFrame(() => {
      playInto(localVideoTrackRef.current, "vc-local-normal");
    });
    return () => cancelAnimationFrame(raf);
  }, [agoraReady, playInto]);

  useEffect(() => {
    if (!agoraReady) return;
    const id = setTimeout(reattachAll, 80);
    return () => clearTimeout(id);
  }, [showWhiteboard, agoraReady, reattachAll]);

  // ── whiteboard toggle sync ───────────────────────────────────────────────
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;
    const handleToggle = ({ open }) => setShowWhiteboard(open);
    socket.on("whiteboard:toggle", handleToggle);
    return () => socket.off("whiteboard:toggle", handleToggle);
  }, [socketRef]);

  // ── screen share ─────────────────────────────────────────────────────────
  const startScreenShare = useCallback(async () => {
    const client = clientRef.current;
    if (!client) return;

    try {
      const screenTrack = await AgoraRTC.createScreenVideoTrack(
        { encoderConfig: "1080p_1", optimizationMode: "detail" },
        "disable" // no audio track from screen
      );

      // createScreenVideoTrack returns array when audio enabled, track when disabled
      const track = Array.isArray(screenTrack) ? screenTrack[0] : screenTrack;
      localScreenTrackRef.current = track;

      await client.publish(track);
      setIsSharingScreen(true);
      setScreenActive(true);

      // Show own screen in main view
      setTimeout(() => playInto(track, "vc-screen-main"), 80);

      // Browser "Stop sharing" button handler
      track.on("track-ended", () => {
        stopScreenShare();
      });

      // Also handle the native MediaStreamTrack ended event
      track._mediaStreamTrack?.addEventListener("ended", () => {
        stopScreenShare();
      });
    } catch (err) {
      // User cancelled the picker — not an error
      if (err.name === "NotAllowedError" || err.code === "PERMISSION_DENIED") return;
      console.error("Screen share error:", err);
    }
  }, [playInto]);

  const stopScreenShare = useCallback(async () => {
    const client = clientRef.current;
    const track  = localScreenTrackRef.current;
    if (!track) return;

    try {
      await client.unpublish(track);
    } catch (_) {}

    track.stop();
    track.close();
    localScreenTrackRef.current = null;

    setIsSharingScreen(false);
    setScreenActive(false);

    // Re-attach camera to normal view
    setTimeout(() => {
      playInto(localVideoTrackRef.current, "vc-local-normal");
    }, 80);
  }, [playInto]);

  const toggleScreenShare = useCallback(() => {
    if (isSharingScreen) stopScreenShare();
    else startScreenShare();
  }, [isSharingScreen, startScreenShare, stopScreenShare]);

  // ── controls ─────────────────────────────────────────────────────────────
  const toggleMic = () => {
    localAudioTrackRef.current?.setEnabled(!micOn);
    setMicOn((v) => !v);
  };
  const toggleVideo = () => {
    localVideoTrackRef.current?.setEnabled(!cameraOn);
    setCameraOn((v) => !v);
  };
  const handleClose = async () => {
    socketRef.current?.emit("video-call:end", { to: targetUser._id });
    localVideoTrackRef.current?.stop();
    localVideoTrackRef.current?.close();
    localAudioTrackRef.current?.close();
    localScreenTrackRef.current?.stop();
    localScreenTrackRef.current?.close();
    await clientRef.current?.leave();
    onClose();
  };

  if (permError) return (
    <div className="fixed inset-0 z-50 bg-[#1c1e21] text-white flex flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="text-6xl">🎥</div>
      <h2 className="text-xl font-semibold text-red-400">Camera & Microphone Access Denied</h2>
      <p className="text-sm text-gray-300 max-w-sm leading-relaxed whitespace-pre-line">{permError}</p>
      <button onClick={onClose} className="mt-2 px-6 py-2 rounded-full bg-white/15 hover:bg-white/25 text-sm transition-colors">Close</button>
    </div>
  );

  // ── layout decisions ─────────────────────────────────────────────────────
  // screenActive = someone is sharing screen (local or remote)
  // Normal mode:  remote fullscreen + local PIP
  // Screen mode:  screen fullscreen + camera tiles on right
  // Whiteboard:   excalidraw fullscreen + camera tiles on right

  return (
    <div className="fixed inset-0 z-50 bg-[#1c1e21] text-white overflow-hidden">

      {/* ══ NORMAL VIDEO MODE ═══════════════════════════════════════════════ */}
      <div
        className="absolute inset-0 transition-opacity duration-200"
        style={{
          opacity: showWhiteboard || screenActive ? 0 : 1,
          pointerEvents: showWhiteboard || screenActive ? "none" : "auto",
        }}
      >
        <div className="absolute inset-0 bg-[#2d2e30] flex items-center justify-center">
          <div
            id="vc-remote-normal"
            style={{ position: "absolute", inset: 0, display: remoteActive ? "block" : "none" }}
          />
          {!remoteActive && (
            <div className="flex flex-col items-center gap-4 z-10">
              <img src={targetUser.profilePic || DEFAULT_PIC} alt={targetUser.firstName}
                className="w-36 h-36 rounded-full object-cover ring-4 ring-white/10" />
              <p className="text-xl font-semibold">{targetUser.firstName}</p>
              <p className="text-sm text-gray-400 animate-pulse">
                {isCaller ? "Ringing…" : "Connecting…"}
              </p>
            </div>
          )}
        </div>

        {/* Local PIP */}
        <div
          className="absolute bottom-28 right-4 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-[#3c4043]"
          style={{ width: 160, height: 120 }}
        >
          <div id="vc-local-normal" style={{ width: "100%", height: "100%", display: cameraOn ? "block" : "none" }} />
          {!cameraOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#3c4043]">
              <img src={user.profilePic || DEFAULT_PIC} alt="You" className="w-14 h-14 rounded-full object-cover" />
            </div>
          )}
          <span className="absolute bottom-1.5 left-2.5 text-[11px] font-medium text-white/60 z-10">You</span>
        </div>
      </div>

      {/* ══ SCREEN SHARE MODE ════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0 flex transition-opacity duration-200"
        style={{
          opacity: screenActive && !showWhiteboard ? 1 : 0,
          pointerEvents: screenActive && !showWhiteboard ? "auto" : "none",
        }}
      >
        {/* Screen main view */}
        <div className="flex-1 bg-black relative">
          <div id="vc-screen-main" style={{ position: "absolute", inset: 0 }} />
          {isSharingScreen && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10
                            px-3 py-1 rounded-full text-xs bg-green-600/80 text-white">
              You are sharing your screen
            </div>
          )}
        </div>

        {/* Camera tiles sidebar */}
        <div className="flex flex-col bg-[#1c1e21] gap-3 p-3" style={{ width: 200, paddingBottom: 96 }}>
          {/* Local camera */}
          <div className="relative rounded-2xl overflow-hidden bg-[#2d2f33] border border-white/10"
            style={{ height: 140 }}>
            <div id="vc-local-screen-pip"
              style={{ position: "absolute", inset: 0, display: cameraOn ? "block" : "none" }} />
            {!cameraOn && (
              <div className="absolute inset-0 flex items-center justify-center">
                <img src={user.profilePic || DEFAULT_PIC} alt="You" className="w-12 h-12 rounded-full object-cover" />
              </div>
            )}
            <NameTag label="You" />
          </div>

          {/* Remote camera */}
          {remoteActive && (
            <div className="relative rounded-2xl overflow-hidden bg-[#2d2f33] border border-white/10"
              style={{ height: 140 }}>
              <div id="vc-remote-screen-pip" style={{ position: "absolute", inset: 0 }} />
              <NameTag label={targetUser.firstName} />
            </div>
          )}
        </div>
      </div>

      {/* ══ WHITEBOARD MODE ══════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0 flex transition-opacity duration-200"
        style={{
          opacity: showWhiteboard ? 1 : 0,
          pointerEvents: showWhiteboard ? "auto" : "none",
        }}
      >
        <div className="flex-1 bg-white overflow-hidden" style={{ paddingTop: 44 }}>
          {showWhiteboard && (
            <Suspense fallback={<div className="w-full h-full bg-white" />}>
              <Whiteboard socketRef={socketRef} roomId={channelName} />
            </Suspense>
          )}
        </div>

        <div className="flex flex-col bg-[#1c1e21] gap-3 p-3" style={{ width: 280, paddingBottom: 96 }}>
          <div className="relative rounded-2xl overflow-hidden bg-[#2d2f33] border border-white/10 flex-1" style={{ minHeight: 0 }}>
            <div id="vc-local-board"
              style={{ position: "absolute", inset: 0, display: cameraOn ? "block" : "none" }} />
            {!cameraOn && (
              <div className="absolute inset-0 flex items-center justify-center">
                <img src={user.profilePic || DEFAULT_PIC} alt="You" className="w-16 h-16 rounded-full object-cover ring-2 ring-white/10" />
              </div>
            )}
            <NameTag label="You" />
          </div>

          <div
            className="relative rounded-2xl overflow-hidden bg-[#2d2f33] border transition-all duration-300"
            style={{
              flex: remoteActive ? "1 1 0%" : "0 0 0px",
              minHeight: 0,
              borderColor: remoteActive ? "rgba(255,255,255,0.1)" : "transparent",
            }}
          >
            <div id="vc-remote-board" style={{ position: "absolute", inset: 0 }} />
            {remoteActive && <NameTag label={targetUser.firstName} />}
          </div>
        </div>
      </div>

      {/* ══ CONTROLS ═════════════════════════════════════════════════════════ */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[9999]
                      flex items-center gap-3 px-5 py-3 rounded-full
                      bg-[#202124]/90 backdrop-blur-md border border-white/10 shadow-2xl">
        <CtrlBtn danger={!micOn} onClick={toggleMic} title={micOn ? "Mute" : "Unmute"}>
          {micOn ? <Mic size={18} /> : <MicOff size={18} />}
        </CtrlBtn>

        <CtrlBtn danger={!cameraOn} onClick={toggleVideo} title={cameraOn ? "Turn off camera" : "Turn on camera"}>
          {cameraOn ? <Video size={18} /> : <VideoOff size={18} />}
        </CtrlBtn>

        <CtrlBtn accent={isSharingScreen} onClick={toggleScreenShare} title={isSharingScreen ? "Stop sharing" : "Share screen"}>
          {isSharingScreen ? <MonitorOff size={18} /> : <Monitor size={18} />}
        </CtrlBtn>

        <CtrlBtn
          accent={showWhiteboard}
          onClick={() => {
            const next = !showWhiteboard;
            setShowWhiteboard(next);
            socketRef.current?.emit("whiteboard:toggle", { to: targetUser._id, open: next });
          }}
          title="Toggle whiteboard"
        >
          <Pencil size={17} />
        </CtrlBtn>

        <button onClick={handleClose}
          className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition-colors shadow-lg">
          <PhoneOff size={20} />
        </button>
      </div>

      {/* Status */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-50 px-4 py-1 rounded-full text-xs text-gray-300 bg-black/50 backdrop-blur pointer-events-none select-none"
        style={{ top: showWhiteboard ? "auto" : 16, bottom: showWhiteboard ? 90 : "auto" }}
      >
        {remoteActive
          ? `Connected with ${targetUser.firstName}`
          : isCaller
            ? `Calling ${targetUser.firstName}…`
            : `Incoming call from ${targetUser.firstName}…`}
      </div>
    </div>
  );
};

// ── re-attach cameras into screen-share sidebar ──────────────────────────
// This is handled inside the screenActive useEffect below in VideoCallInner
// (add this after the whiteboard toggle useEffect)

const NameTag = ({ label }) => (
  <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
    <span className="text-[12px] font-medium text-white drop-shadow">{label}</span>
  </div>
);

const CtrlBtn = ({ onClick, title, danger, accent, children }) => (
  <button onClick={onClick} title={title}
    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-150 active:scale-95
      ${danger ? "bg-red-600 hover:bg-red-500" : accent ? "bg-orange-500 hover:bg-orange-400" : "bg-white/15 hover:bg-white/25"}`}>
    {children}
  </button>
);

export default VideoCall;