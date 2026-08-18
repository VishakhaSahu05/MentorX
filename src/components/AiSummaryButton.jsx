// src/components/AiSummaryButton.jsx
import AiSummaryModal from "./AiSummaryModal";
import useChatSummary from "../hooks/useChatSummary";

const AiSummaryButton = ({ conversationId }) => {
  const { summary, isLoading, error, isModalOpen, fetchSummary, closeModal } =
    useChatSummary(conversationId);

  return (
    <>
      <button
        onClick={fetchSummary}
        disabled={isLoading || !conversationId}
        title="Generate AI Summary"
        className={`
          group relative inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5
          rounded-lg text-xs font-medium border shrink-0
          transition-all duration-200 select-none overflow-hidden
          ${isLoading
            ? "bg-purple-900/30 border-purple-500/30 text-purple-300 cursor-not-allowed"
            : "border-white/10 text-gray-300 hover:border-purple-400/40 hover:text-purple-200 active:scale-95 cursor-pointer"
          }
        `}
        style={
          !isLoading
            ? { background: "linear-gradient(135deg, rgba(168,85,247,0.08), rgba(16,185,129,0.06))" }
            : undefined
        }
      >
        {!isLoading && (
          <span
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.22), rgba(16,185,129,0.14))" }}
          />
        )}
        {isLoading ? (
          <>
            <svg
              className="relative animate-spin shrink-0"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle cx="12" cy="12" r="10" stroke="#6b21a8" strokeWidth="3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span className="relative hidden sm:inline">Summarizing…</span>
          </>
        ) : (
          <>
            <span className="relative">✨</span>
            <span className="relative hidden sm:inline">AI Summary</span>
          </>
        )}
      </button>

      <AiSummaryModal
        isOpen={isModalOpen}
        isLoading={isLoading}
        summary={summary}
        error={error}
        onClose={closeModal}
      />
    </>
  );
};

export default AiSummaryButton;
