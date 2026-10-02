import React from "react";
import { Video, X } from "lucide-react";

const DEFAULT_PIC =
  "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png";

/**
 * Shown to the participant who did NOT press Record.
 * Recording cannot start until they accept, so this is a consent gate.
 */
const RecordingConsentModal = ({ from, onAccept, onDecline, busy }) => (
  <div className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center p-4">
    <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl border border-white/10">
      <div className="relative mb-5 inline-block">
        <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-60" />
        <img
          src={from?.profilePic || DEFAULT_PIC}
          alt={from?.firstName || "Participant"}
          className="relative w-20 h-20 rounded-full object-cover border-4 border-red-500 mx-auto"
        />
      </div>

      <h2 className="text-white text-lg sm:text-xl font-semibold mb-2">
        {from?.firstName || "Your contact"} wants to record this call
      </h2>

      <p className="text-gray-400 text-sm mb-6 leading-relaxed">
        If you accept, both participants&apos; video and audio will be recorded
        and saved to MentorX. A download link will be emailed to both of you
        when it is ready.
      </p>

      <div className="flex justify-center gap-3">
        <button
          onClick={onDecline}
          disabled={busy}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors disabled:opacity-50"
        >
          <X size={16} />
          Decline
        </button>
        <button
          onClick={onAccept}
          disabled={busy}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
        >
          <Video size={16} />
          {busy ? "Starting…" : "Accept"}
        </button>
      </div>

      <p className="text-gray-500 text-xs mt-5">
        Recording will not start unless you accept.
      </p>
    </div>
  </div>
);

export default RecordingConsentModal;
