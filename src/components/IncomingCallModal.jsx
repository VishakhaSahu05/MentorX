import React, { useEffect, useRef } from "react";
import { Phone, PhoneOff } from "lucide-react";

const DEFAULT_PIC ="https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png";

// Generates a phone-ringing tone using Web Audio API
// No external file needed — plays a clean looping ring tone natively
const useRingtone = () => {
  const audioCtxRef = useRef(null);
  const intervalRef = useRef(null);

  const playRing = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;

    // one ring = two beeps with a gap, then silence before looping
    const ringOnce = (startTime) => {
      [0, 0.4].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(440, ctx.currentTime + startTime + offset);

        gain.gain.setValueAtTime(0.3, ctx.currentTime + startTime + offset);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + startTime + offset + 0.3,
        );

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + startTime + offset);
        osc.stop(ctx.currentTime + startTime + offset + 0.3);
      });
    };

    // loop every 2 seconds
    ringOnce(0);
    intervalRef.current = setInterval(() => {
      ringOnce(0);
    }, 2000);
  };

  const stopRing = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  };

  return { playRing, stopRing };
};


const IncomingCallModal = ({ caller, callType = "video", onAccept, onReject }) => {
  const { playRing, stopRing } = useRingtone();

  useEffect(() => {
    playRing();
    return () => stopRing();
  }, []);

  const handleAccept = () => {
    stopRing();
    onAccept();
  };

  const handleReject = () => {
    stopRing();
    onReject();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Caller profile picture with pulsing animation */}
        <div className="relative mb-5 sm:mb-6 inline-block">
          <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></div>
          <img
            src={caller.profilePic || DEFAULT_PIC}
            alt={caller.firstName}
            className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-green-500 mx-auto"
          />
        </div>

        {/* Caller name */}
        <h2 className="text-white text-xl sm:text-2xl font-semibold mb-2 truncate">
          {caller.firstName} {caller.lastName || ""}
        </h2>

        {/* Call status */}
        <p className="text-gray-400 text-base sm:text-lg mb-6 sm:mb-8">
          Incoming {callType === "voice" ? "voice" : "video"} call...
        </p>

        {/* Action buttons */}
        <div className="flex justify-center gap-6">
          {/* Reject button */}
          <button
            onClick={handleReject}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all transform hover:scale-110 shadow-lg"
            aria-label="Reject call"
          >
            <PhoneOff className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </button>

          {/* Accept button */}
          <button
            onClick={handleAccept}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center transition-all transform hover:scale-110 shadow-lg animate-pulse"
            aria-label="Accept call"
          >
            <Phone className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </button>
        </div>

        {/* Helper text */}
        <p className="text-gray-500 text-sm mt-5 sm:mt-6">
          Accept to start {callType === "voice" ? "voice" : "video"} call
        </p>
      </div>
    </div>
  );
};

export default IncomingCallModal;