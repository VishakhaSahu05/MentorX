// src/components/AiSummaryModal.jsx
import { useEffect, useRef } from "react";

const parseSummary = (rawSummary) => {
  if (!rawSummary) return null;

  const sections = {
    whatHappened: "",
    importantPoints: [],
    actionItems: [],
  };

  const whatHappenedMatch = rawSummary.match(
    /What Happened:\s*(.+?)(?=\n\nImportant Points:|$)/s
  );
  if (whatHappenedMatch) {
    sections.whatHappened = whatHappenedMatch[1].trim();
  }

  const importantMatch = rawSummary.match(
    /Important Points:\s*([\s\S]+?)(?=\n\nAction Items:|$)/
  );
  if (importantMatch) {
    sections.importantPoints = importantMatch[1]
      .split("\n")
      .map((line) => line.replace(/^[•\-\*]\s*/, "").trim())
      .filter(Boolean);
  }

  const actionMatch = rawSummary.match(/Action Items:\s*([\s\S]+?)$/);
  if (actionMatch) {
    sections.actionItems = actionMatch[1]
      .split("\n")
      .map((line) => line.replace(/^[•\-\*]\s*/, "").trim())
      .filter(Boolean);
  }

  return sections;
};

const AiSummaryModal = ({ isOpen, isLoading, summary, error, onClose }) => {
  const modalRef = useRef(null);
  const parsedSummary = summary ? parseSummary(summary) : null;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        style={{
          animation: "modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards",
          maxHeight: "88vh",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <h2 className="text-white font-semibold text-base">AI Chat Summary</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(88vh - 68px)" }}>

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="relative w-12 h-12">
                <div
                  className="absolute inset-0 rounded-full border-4 border-purple-900"
                  style={{ borderTopColor: "#9333ea", animation: "spin 0.8s linear infinite" }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-lg">✨</span>
              </div>
              <div className="text-center">
                <p className="text-white font-medium text-sm">Generating summary…</p>
                <p className="text-gray-500 text-xs mt-1">Analyzing your conversation with AI</p>
              </div>
            </div>
          )}

          {/* Error */}
          {!isLoading && error && (
            <div className="p-6">
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <span className="text-red-400 text-lg">⚠️</span>
                <div>
                  <p className="text-red-400 font-medium text-sm">Failed to generate summary</p>
                  <p className="text-red-400/70 text-xs mt-0.5">{error}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="mt-4 w-full py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {/* Summary */}
          {!isLoading && !error && parsedSummary && (
            <div className="p-6 space-y-5">

              {/* What Happened */}
              {parsedSummary.whatHappened && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">📋</span>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">What Happened</p>
                  </div>
                  <p className="text-gray-200 text-sm leading-relaxed bg-purple-600/10 border border-purple-500/20 rounded-xl px-4 py-3">
                    {parsedSummary.whatHappened}
                  </p>
                </div>
              )}

              {/* Important Points */}
              {parsedSummary.importantPoints.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">💡</span>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Important Points</p>
                  </div>
                  <ul className="space-y-2">
                    {parsedSummary.importantPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-400" />
                        <span className="text-gray-300 text-sm leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Items */}
              {parsedSummary.actionItems.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">✅</span>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Action Items</p>
                  </div>
                  <ul className="space-y-2">
                    {parsedSummary.actionItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="flex-shrink-0 mt-0.5 w-4 h-4 rounded border-2 border-emerald-500/50 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        </span>
                        <span className="text-gray-300 text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Fallback if parsing fails */}
              {!parsedSummary.whatHappened &&
                parsedSummary.importantPoints.length === 0 &&
                parsedSummary.actionItems.length === 0 && (
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{summary}</p>
              )}

              {/* Footer */}
              <div className="pt-2 border-t border-white/10">
                <p className="text-xs text-gray-600 text-center">
                  ✨ AI-generated · Not stored · Based on last 100 messages
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AiSummaryModal;
