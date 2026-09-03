import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { Mic, MicOff, PhoneOff } from "lucide-react";
import { useSelector } from "react-redux";
import AgoraRTC from "agora-rtc-sdk-ng";
import { DEFAULT_PIC, BASE_URL } from "../../utils/constant";

const VoiceCall = ({ targetUser, onClose, isCaller, socketRef }) => {
  const user = useSelector((s) => s.user);

  if (!user || !targetUser) return null;

  return (
    <VoiceCallInner
      user={user}
      targetUser={targetUser}
      onClose={onClose}
      isCaller={isCaller}
      socketRef={socketRef}
    />
  );
};

const VoiceCallInner = ({
  user,
  targetUser,
  onClose,
  isCaller,
  socketRef,
}) => {
  const [remoteActive, setRemoteActive] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [permError, setPermError] = useState(null);

  const clientRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const timerRef = useRef(null);

  const channelName = [user._id, targetUser._id].sort().join("_");
  const localUidNum = (parseInt(user._id.slice(-8), 16) % 100000) + 1;

  const targetName =
    `${targetUser.firstName || ""} ${targetUser.lastName || ""}`.trim() ||
    "Unknown";

  const targetPic = targetUser.profilePic || DEFAULT_PIC;

  /*
   * Format call duration:
   * 0:00
   * 1:05
   * 12:37
   */
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  // Agora initialization
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        if (isCaller) {
          socketRef.current?.emit("voice-call:start", {
            to: targetUser._id,
          });
        }

        const res = await fetch(
          `${BASE_URL}/api/agora-token?channelName=${channelName}&uid=${localUidNum}`,
        );

        const { token, appId } = await res.json();

        if (!mounted) return;

        const client = AgoraRTC.createClient({
          mode: "rtc",
          codec: "vp8",
        });

        clientRef.current = client;

        const localUid = await client.join(
          appId,
          channelName,
          token,
          localUidNum,
        );

        console.log("[VoiceCall] joined uid:", localUid);

        client.on("user-published", async (remoteUser, mediaType) => {
          if (remoteUser.uid === localUid) return;

          await client.subscribe(remoteUser, mediaType);

          if (mediaType === "audio" && remoteUser.audioTrack) {
            remoteUser.audioTrack.play();

            if (mounted) {
              setRemoteActive(true);
            }
          }
        });

        client.on("user-unpublished", (remoteUser, mediaType) => {
          if (mediaType === "audio" && mounted) {
            setRemoteActive(false);
          }
        });

        let audioTrack;

        try {
          audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        } catch (err) {
          setPermError(
            JSON.stringify({
              name: err?.name,
              code: err?.code,
              message: err?.message,
            }),
          );
          return;
        }

        if (!mounted) {
          audioTrack.close();
          return;
        }

        localAudioTrackRef.current = audioTrack;

        await client.publish([audioTrack]);

        console.log("[VoiceCall] microphone published");
      } catch (err) {
        console.error("Agora voice call init error:", err);

        if (mounted) {
          setPermError(
            err?.message || "Unable to initialize voice call.",
          );
        }
      }
    };

    init();

    return () => {
      mounted = false;

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      localAudioTrackRef.current?.stop();
      localAudioTrackRef.current?.close();

      localAudioTrackRef.current = null;

      clientRef.current?.leave();
      clientRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start timer when remote user connects
  useEffect(() => {
    if (!remoteActive) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [remoteActive]);

  const toggleMic = useCallback(() => {
    const track = localAudioTrackRef.current;

    if (!track) return;

    const nextState = !micOn;

    track.setEnabled(nextState);
    setMicOn(nextState);
  }, [micOn]);

  const handleClose = useCallback(async () => {
    socketRef.current?.emit("voice-call:end", {
      to: targetUser._id,
    });

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    localAudioTrackRef.current?.stop();
    localAudioTrackRef.current?.close();

    localAudioTrackRef.current = null;

    await clientRef.current?.leave();

    clientRef.current = null;

    onClose();
  }, [onClose, socketRef, targetUser._id]);

  if (permError) {
    return (
      <div className="fixed inset-0 z-50 bg-[#111315] text-white flex flex-col items-center justify-center px-6">
        <div className="w-24 h-24 rounded-full overflow-hidden mb-6 ring-4 ring-red-500/20">
          <img
            src={targetPic}
            alt={targetName}
            className="w-full h-full object-cover"
          />
        </div>

        <h2 className="text-xl font-semibold text-red-400 text-center">
          Microphone Access Denied
        </h2>

        <p className="text-sm text-gray-400 max-w-md text-center mt-3 leading-relaxed">
          Please allow microphone access from your browser settings and
          try again.
        </p>

        <button
          onClick={onClose}
          className="mt-7 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#111315] text-white overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Main content */}
      <div className="relative min-h-full flex flex-col items-center justify-center px-6 pb-32">
        {/* Call label */}
        <div className="absolute top-7 left-1/2 -translate-x-1/2">
          <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-xs text-white/60 tracking-wide">
              {remoteActive ? "VOICE CALL" : "CONNECTING"}
            </span>
          </div>
        </div>

        {/* Avatar */}
        <div className="relative mb-7">
          {/* Outer pulse */}
          <div
            className={`absolute inset-[-18px] rounded-full border border-white/10 ${
              !remoteActive ? "animate-ping" : ""
            }`}
            style={{ animationDuration: "2.5s" }}
          />

          <div
            className={`absolute inset-[-8px] rounded-full border transition-all duration-500 ${
              remoteActive
                ? "border-green-400/30"
                : "border-blue-400/30"
            }`}
          />

          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden bg-[#292c30] ring-4 ring-white/10 shadow-2xl">
            <img
              src={targetPic}
              alt={targetName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Name */}
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-center">
          {targetName}
        </h1>

        {/* Status */}
        <div className="mt-3 flex items-center gap-2">
          {remoteActive ? (
            <>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-gray-400">
                {formatDuration(callDuration)}
              </span>
            </>
          ) : (
            <span className="text-sm text-gray-400 animate-pulse">
              {isCaller
                ? `Calling ${targetUser.firstName || ""}…`
                : `Connecting to ${targetUser.firstName || ""}…`}
            </span>
          )}
        </div>

        {/* Voice wave */}
        <div className="mt-10 h-8 flex items-center justify-center gap-1.5">
          {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((height, index) => (
            <span
              key={index}
              className={`w-1 rounded-full transition-all ${
                remoteActive
                  ? "bg-white/60 animate-pulse"
                  : "bg-white/20"
              }`}
              style={{
                height: `${height * 6}px`,
                animationDelay: `${index * 100}ms`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-5">
        {/* Mic */}
        <button
          onClick={toggleMic}
          title={micOn ? "Mute microphone" : "Unmute microphone"}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 shadow-xl ${
            micOn
              ? "bg-white/10 hover:bg-white/20 border border-white/10"
              : "bg-red-500 hover:bg-red-400"
          }`}
        >
          {micOn ? <Mic size={22} /> : <MicOff size={22} />}
        </button>

        {/* End */}
        <button
          onClick={handleClose}
          title="End call"
          className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition-all duration-200 active:scale-95 shadow-xl shadow-red-900/30"
        >
          <PhoneOff size={24} />
        </button>
      </div>
    </div>
  );
};

export default VoiceCall;