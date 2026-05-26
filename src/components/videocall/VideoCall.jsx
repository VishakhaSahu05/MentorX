import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { useSelector } from "react-redux";

import { DEFAULT_PIC } from "../../utils/constant";
import { useMedia } from "./useMedia";
import { usePeer } from "./usePeer";

const VideoCall = ({ targetUser, onClose, isCaller, socketRef }) => {
  const user = useSelector((s) => s.user);

  const remoteVideoRef = useRef(null);
  const remoteStreamRef = useRef(null); // stores stream from ontrack until video element mounts
  const [remoteActive, setRemoteActive] = useState(false);

  const setRemoteVideoEl = (el) => {
    remoteVideoRef.current = el;
    if (el && remoteStreamRef.current) {
      el.srcObject = remoteStreamRef.current;
      el.play().catch(console.error);
    }
  };

  const startEmittedRef = useRef(false);
  const acceptEmittedRef = useRef(false);

  const {
    localStreamRef,
    startCamera,
    setLocalVideoEl,
    cameraOn,
    micOn,
    toggleVideo,
    toggleMic,
  } = useMedia();

  const { createOffer, handleOffer, handleAnswer, handleICE, cleanup } =
    usePeer({
      socketRef,
      localStreamRef,
      remoteVideoRef,
      remoteStreamRef,
      targetUser,
      setRemoteActive,
    });

  useEffect(() => {
    let cancelled = false;

    const onCreateOffer = () => {
      if (cancelled) return;
      console.log("✅ GOT create-offer");
      createOffer();
    };

    const onOffer = (payload) => {
      if (cancelled) return;
      console.log("✅ GOT offer");
      handleOffer(payload);
    };

    const onAnswer = (payload) => {
      if (cancelled) return;
      console.log("✅ GOT answer");
      handleAnswer(payload);
    };

    const onICE = (payload) => {
      if (cancelled) return;
      console.log("✅ GOT ice");
      handleICE(payload);
    };

    const init = async () => {
      try {
        console.log("🎥 VideoCall init, isCaller:", isCaller);

        await startCamera();

        if (cancelled) return;

        console.log("🎥 Camera ready, registering listeners...");

        socketRef.current.on("video-call:create-offer", onCreateOffer);
        socketRef.current.on("video-call:offer", onOffer);
        socketRef.current.on("video-call:answer", onAnswer);
        socketRef.current.on("video-call:ice", onICE);

        if (isCaller && !startEmittedRef.current) {
          startEmittedRef.current = true;
          console.log("📞 Emitting video-call:start");
          socketRef.current.emit("video-call:start", {
            to: targetUser._id,
          });
        }

        if (!isCaller && !acceptEmittedRef.current) {
          acceptEmittedRef.current = true;
          console.log("📞 Emitting video-call:accepted");
          socketRef.current.emit("video-call:accepted", {
            to: targetUser._id,
          });
        }
      } catch (err) {
        console.error("❌ VideoCall init ERROR:", err);
      }
    };

    init();

    return () => {
      console.log("VideoCall cleanup");
      cancelled = true;
      socketRef.current?.off("video-call:create-offer", onCreateOffer);
      socketRef.current?.off("video-call:offer", onOffer);
      socketRef.current?.off("video-call:answer", onAnswer);
      socketRef.current?.off("video-call:ice", onICE);
      cleanup();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black text-white z-50">
      <div className="absolute top-4 left-4 text-sm text-gray-300">
        {remoteActive
          ? `Connected with ${targetUser.firstName}`
          : isCaller
            ? `Calling ${targetUser.firstName}…`
            : `Incoming call from ${targetUser.firstName}…`}
      </div>

      {/* main video */}
      <div className="flex items-center justify-center h-full relative">
        <video
          ref={setRemoteVideoEl}
          autoPlay
          playsInline
          className={`w-full h-full object-cover ${
            remoteActive ? "block" : "hidden"
          }`}
        />

        {!remoteActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <img
              src={targetUser.profilePic || DEFAULT_PIC}
              alt={targetUser.firstName}
              className="w-32 h-32 rounded-full object-cover mb-3"
            />

            <span className="text-lg font-semibold">
              {targetUser.firstName}
            </span>
          </div>
        )}
      </div>

      {/* local PIP */}
      <div className="absolute bottom-28 right-6 w-40 h-28 rounded-lg overflow-hidden border border-gray-600">
        {cameraOn ? (
          <video
            ref={setLocalVideoEl}
            muted
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={user.profilePic || DEFAULT_PIC}
            alt="You"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* controls */}
      <div className="absolute bottom-8 w-full flex justify-center gap-6">
        <button
          onClick={toggleMic}
          className={`w-14 h-14 rounded-full ${
            micOn ? "bg-gray-700" : "bg-red-600"
          } flex items-center justify-center`}
        >
          {micOn ? <Mic /> : <MicOff />}
        </button>

        <button
          onClick={onClose}
          className="w-16 h-16 rounded-full bg-red-700 flex items-center justify-center"
        >
          <PhoneOff />
        </button>

        <button
          onClick={toggleVideo}
          className={`w-14 h-14 rounded-full ${
            cameraOn ? "bg-gray-700" : "bg-red-600"
          } flex items-center justify-center`}
        >
          {cameraOn ? <Video /> : <VideoOff />}
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
