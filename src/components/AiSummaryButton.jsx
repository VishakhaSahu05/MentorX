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
          inline-flex items-center gap-1.5 px-3 py-1.5
          rounded-lg text-xs font-medium border
          transition-all duration-200 select-none
          ${isLoading
            ? "bg-purple-900/30 border-purple-700/30 text-purple-400 cursor-not-allowed"
            : "bg-white/5 border-white/10 text-gray-300 hover:bg-purple-600/20 hover:border-purple-500/40 hover:text-purple-300 active:scale-95 cursor-pointer"
          }
        `}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle cx="12" cy="12" r="10" stroke="#6b21a8" strokeWidth="3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span>Summarizing…</span>
          </>
        ) : (
          <>
            <span>✨</span>
            <span>AI Summary</span>
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
