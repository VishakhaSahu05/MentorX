import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  Suspense,
} from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Pencil } from "lucide-react";
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
  const [remoteActive, setRemoteActive] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [agoraReady, setAgoraReady] = useState(false);
  const [permError, setPermError] = useState(null); // camera/mic permission error

  const clientRef = useRef(null);
  const localVideoTrackRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const remoteVideoTrackRef = useRef(null);
  const showWBRef = useRef(false);

  useEffect(() => {
    showWBRef.current = showWhiteboard;
  }, [showWhiteboard]);

  const channelName = [user._id, targetUser._id].sort().join("_");
  // Stable numeric UID from last 8 chars of MongoDB ObjectId (avoids uid=0 collision)
  const localUidNum = (parseInt(user._id.slice(-8), 16) % 100000) + 1;

  // ── play a track into a div by ID ───────────────────────────────────────
  const playInto = useCallback((track, divId) => {
    if (!track) return;
    const el = document.getElementById(divId);
    if (!el) {
      console.error(`[VideoCall] div#${divId} NOT FOUND in DOM`);
      return;
    }
    try {
      track.stop();
      track.play(divId);
      console.log(`[VideoCall] playing into #${divId} ✓`);
    } catch (e) {
      console.error(`[VideoCall] play error on #${divId}:`, e);
    }
  }, []);

  // ── re-attach both tracks to whichever layout is visible ────────────────
  const reattachAll = useCallback(() => {
    const isBoard = showWBRef.current;
    playInto(
      localVideoTrackRef.current,
      isBoard ? "vc-local-board" : "vc-local-normal",
    );
    playInto(
      remoteVideoTrackRef.current,
      isBoard ? "vc-remote-board" : "vc-remote-normal",
    );
  }, [playInto]);

  // ── Agora init ───────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        if (isCaller) {
          socketRef.current?.emit("video-call:start", { to: targetUser._id });
        }

        const res = await fetch(
          `${BASE_URL}/api/agora-token?channelName=${channelName}&uid=${localUidNum}`,
        );
        const { token, appId } = await res.json();

        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        clientRef.current = client;

        // Join FIRST so we have our own UID before registering listeners
        const localUid = await client.join(
          appId,
          channelName,
          token,
          localUidNum,
        );
        console.log("[VideoCall] joined with uid:", localUid);

        // Register AFTER join so localUid is defined in closure
        client.on("user-published", async (remoteUser, mediaType) => {
          console.log(
            "[VideoCall] user-published uid:",
            remoteUser.uid,
            "| my uid:",
            localUid,
          );
          // Hard skip — never subscribe to our own stream
          if (remoteUser.uid === localUid) {
            console.warn("[VideoCall] skipping own stream");
            return;
          }
          await client.subscribe(remoteUser, mediaType);
          if (mediaType === "video") {
            remoteVideoTrackRef.current = remoteUser.videoTrack;
            const id = showWBRef.current
              ? "vc-remote-board"
              : "vc-remote-normal";
            remoteUser.videoTrack.play(id);
            setRemoteActive(true);
          }
          if (mediaType === "audio") remoteUser.audioTrack.play();
        });

        client.on("user-unpublished", (_u, mediaType) => {
          if (mediaType === "video") {
            remoteVideoTrackRef.current = null;
            setRemoteActive(false);
          }
        });

        let audioTrack, videoTrack;
        try {
          [audioTrack, videoTrack] =
            await AgoraRTC.createMicrophoneAndCameraTracks();
        } catch (err) {
          console.error("AGORA TRACK ERROR:", err);

          setPermError(
            JSON.stringify({
              name: err?.name,
              code: err?.code,
              message: err?.message,
            }),
          );

          return;
        }
        localAudioTrackRef.current = audioTrack;
        localVideoTrackRef.current = videoTrack;

        await client.publish([audioTrack, videoTrack]);

        // ↓ Signal React that tracks are ready — DON'T call play() here.
        //   A useEffect below will call play() once DOM is confirmed ready.
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
      clientRef.current?.leave();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Play local video AFTER React has painted the DOM ────────────────────
  // This fires after the first render that has agoraReady=true,
  // so div#vc-local-normal is guaranteed to exist in the DOM.
  useEffect(() => {
    if (!agoraReady) return;
    // requestAnimationFrame = after browser paint = DOM is 100% ready
    const raf = requestAnimationFrame(() => {
      playInto(localVideoTrackRef.current, "vc-local-normal");
    });
    return () => cancelAnimationFrame(raf);
  }, [agoraReady, playInto]);

  // ── Re-attach both tracks when switching layouts ─────────────────────────
  useEffect(() => {
    if (!agoraReady) return;
    const id = setTimeout(reattachAll, 80);
    return () => clearTimeout(id);
  }, [showWhiteboard, agoraReady, reattachAll]);

  // ── Controls ─────────────────────────────────────────────────────────────
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
    await clientRef.current?.leave();
    onClose();
  };

  if (permError)
    return (
      <div className="fixed inset-0 z-50 bg-[#1c1e21] text-white flex flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="text-6xl">🎥</div>
        <h2 className="text-xl font-semibold text-red-400">
          Camera & Microphone Access Denied
        </h2>
        <p className="text-sm text-gray-300 max-w-sm leading-relaxed whitespace-pre-line">
          {permError}
        </p>
        <button
          onClick={onClose}
          className="mt-2 px-6 py-2 rounded-full bg-white/15 hover:bg-white/25 text-sm transition-colors"
        >
          Close
        </button>
      </div>
    );

  return (
    <div className="fixed inset-0 z-50 bg-[#1c1e21] text-white overflow-hidden">
      {/* ══ NORMAL MODE ══════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0 transition-opacity duration-200"
        style={{
          opacity: showWhiteboard ? 0 : 1,
          pointerEvents: showWhiteboard ? "none" : "auto",
        }}
      >
        {/* Remote fullscreen */}
        <div className="absolute inset-0 bg-[#2d2e30] flex items-center justify-center">
          <div
            id="vc-remote-normal"
            style={{
              position: "absolute",
              inset: 0,
              display: remoteActive ? "block" : "none",
            }}
          />
          {!remoteActive && (
            <div className="flex flex-col items-center gap-4 z-10">
              <img
                src={targetUser.profilePic || DEFAULT_PIC}
                alt={targetUser.firstName}
                className="w-36 h-36 rounded-full object-cover ring-4 ring-white/10"
              />
              <p className="text-xl font-semibold">{targetUser.firstName}</p>
              <p className="text-sm text-gray-400 animate-pulse">
                {isCaller ? "Ringing…" : "Connecting…"}
              </p>
            </div>
          )}
        </div>

        {/* Local PIP */}
        <div
          className="absolute bottom-28 right-4 rounded-2xl overflow-hidden
                     border-2 border-white/20 shadow-2xl bg-[#3c4043]"
          style={{ width: 160, height: 120 }}
        >
          <div
            id="vc-local-normal"
            style={{
              width: "100%",
              height: "100%",
              display: cameraOn ? "block" : "none",
            }}
          />
          {!cameraOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#3c4043]">
              <img
                src={user.profilePic || DEFAULT_PIC}
                alt="You"
                className="w-14 h-14 rounded-full object-cover"
              />
            </div>
          )}
          <span className="absolute bottom-1.5 left-2.5 text-[11px] font-medium text-white/60 z-10">
            You
          </span>
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
        {/* Whiteboard */}
        <div className="flex-1 bg-white overflow-hidden">
          {showWhiteboard && (
            <Suspense fallback={<div className="w-full h-full bg-white" />}>
              <Whiteboard />
            </Suspense>
          )}
        </div>

        {/* Right sidebar */}
        <div
          className="flex flex-col bg-[#1c1e21] gap-3 p-3"
          style={{ width: 280, paddingBottom: 96 }}
        >
          {/* Local tile */}
          <div
            className="relative rounded-2xl overflow-hidden bg-[#2d2f33]
                       border border-white/10 flex-1"
            style={{ minHeight: 0 }}
          >
            <div
              id="vc-local-board"
              style={{
                position: "absolute",
                inset: 0,
                display: cameraOn ? "block" : "none",
              }}
            />
            {!cameraOn && (
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src={user.profilePic || DEFAULT_PIC}
                  alt="You"
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-white/10"
                />
              </div>
            )}
            <NameTag label="You" />
          </div>

          {/* Remote tile — Case A: 0px / Case B: flex-1 */}
          <div
            className="relative rounded-2xl overflow-hidden bg-[#2d2f33]
                       border transition-all duration-300"
            style={{
              flex: remoteActive ? "1 1 0%" : "0 0 0px",
              minHeight: 0,
              borderColor: remoteActive
                ? "rgba(255,255,255,0.1)"
                : "transparent",
            }}
          >
            <div
              id="vc-remote-board"
              style={{ position: "absolute", inset: 0 }}
            />
            {remoteActive && <NameTag label={targetUser.firstName} />}
          </div>
        </div>
      </div>

      {/* ══ CONTROLS ═════════════════════════════════════════════════════════ */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[9999]
                   flex items-center gap-3 px-5 py-3 rounded-full
                   bg-[#202124]/90 backdrop-blur-md
                   border border-white/10 shadow-2xl"
      >
        <CtrlBtn
          danger={!micOn}
          onClick={toggleMic}
          title={micOn ? "Mute" : "Unmute"}
        >
          {micOn ? <Mic size={18} /> : <MicOff size={18} />}
        </CtrlBtn>

        <CtrlBtn
          danger={!cameraOn}
          onClick={toggleVideo}
          title={cameraOn ? "Turn off camera" : "Turn on camera"}
        >
          {cameraOn ? <Video size={18} /> : <VideoOff size={18} />}
        </CtrlBtn>

        <CtrlBtn
          accent={showWhiteboard}
          onClick={() => setShowWhiteboard((v) => !v)}
          title="Toggle whiteboard"
        >
          <Pencil size={17} />
        </CtrlBtn>

        <button
          onClick={handleClose}
          className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-500
                     flex items-center justify-center transition-colors shadow-lg"
        >
          <PhoneOff size={20} />
        </button>
      </div>

      {/* Status */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 z-50
                      px-4 py-1 rounded-full text-xs text-gray-300
                      bg-black/50 backdrop-blur pointer-events-none select-none"
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

const NameTag = ({ label }) => (
  <div
    className="absolute bottom-0 left-0 right-0 z-10
                  bg-gradient-to-t from-black/70 to-transparent px-3 py-2"
  >
    <span className="text-[12px] font-medium text-white drop-shadow">
      {label}
    </span>
  </div>
);

const CtrlBtn = ({ onClick, title, danger, accent, children }) => (
  <button
    onClick={onClick}
    title={title}
    className={`w-11 h-11 rounded-full flex items-center justify-center
                transition-all duration-150 active:scale-95
                ${
                  danger
                    ? "bg-red-600 hover:bg-red-500"
                    : accent
                      ? "bg-orange-500 hover:bg-orange-400"
                      : "bg-white/15 hover:bg-white/25"
                }`}
  >
    {children}
  </button>
);

export default VideoCall;
