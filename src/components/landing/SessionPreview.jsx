import { Mic, MonitorUp, PenTool, PhoneOff, Sparkles, Video } from "lucide-react";

/**
 * Illustration for the hero: what a MentorX session looks like (video tiles,
 * shared whiteboard, recording, AI summary). Pure markup, no screenshots, so
 * it stays sharp at any size and never shows a real person's data.
 */
const SessionPreview = () => (
  <div className="relative w-full max-w-lg mx-auto" aria-hidden="true">
    {/* Call window */}
    <div className="rounded-3xl bg-[#0b1f1a] p-3 sm:p-4 shadow-2xl shadow-emerald-900/30 ring-1 ring-black/5">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-white/90 bg-white/10 rounded-full px-2.5 py-1">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          REC 12:48
        </div>
        <span className="text-[11px] text-white/50">Mentorship session</span>
      </div>

      <div className="grid grid-cols-[1fr_96px] sm:grid-cols-[1fr_120px] gap-3">
        {/* Whiteboard */}
        <div className="relative rounded-2xl bg-white aspect-[4/3] overflow-hidden">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1.5 bg-white rounded-lg shadow px-2 py-1">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`w-3.5 h-3.5 rounded ${i === 1 ? "bg-indigo-200" : "bg-gray-200"}`}
              />
            ))}
          </div>
          <svg viewBox="0 0 240 180" className="absolute inset-0 w-full h-full">
            <rect x="22" y="58" width="62" height="34" rx="6" fill="none" stroke="#10b981" strokeWidth="2.5" />
            <rect x="150" y="40" width="66" height="34" rx="6" fill="none" stroke="#0f2f26" strokeWidth="2.5" />
            <rect x="150" y="104" width="66" height="34" rx="6" fill="none" stroke="#0f2f26" strokeWidth="2.5" />
            <path d="M84 75 C 112 75, 118 57, 148 57" fill="none" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
            <path d="M84 75 C 112 75, 118 121, 148 121" fill="none" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
            <text x="53" y="79" textAnchor="middle" fontSize="11" fill="#065f46" fontFamily="sans-serif">API</text>
            <text x="183" y="61" textAnchor="middle" fontSize="11" fill="#0f2f26" fontFamily="sans-serif">Cache</text>
            <text x="183" y="125" textAnchor="middle" fontSize="11" fill="#0f2f26" fontFamily="sans-serif">DB</text>
            <path d="M30 150 q 20 -14 40 0 t 40 0" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill="#64748b" />
              </marker>
            </defs>
          </svg>
        </div>

        {/* Camera tiles */}
        <div className="flex flex-col gap-3">
          <div className="relative flex-1 rounded-2xl bg-linear-to-br from-emerald-700 to-emerald-900 flex items-center justify-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-400/90 flex items-center justify-center text-sm font-bold text-emerald-950">
              M
            </div>
            <span className="absolute bottom-1.5 left-2 text-[10px] text-white/80">Mentor</span>
          </div>
          <div className="relative flex-1 rounded-2xl bg-linear-to-br from-slate-600 to-slate-800 flex items-center justify-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-sky-400/90 flex items-center justify-center text-sm font-bold text-sky-950">
              Y
            </div>
            <span className="absolute bottom-1.5 left-2 text-[10px] text-white/80">You</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-2 mt-3">
        {[Mic, Video, MonitorUp, PenTool].map((Icon, i) => (
          <span
            key={i}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              i === 3 ? "bg-orange-500 text-white" : "bg-white/10 text-white/80"
            }`}
          >
            <Icon size={14} />
          </span>
        ))}
        <span className="w-8 h-8 rounded-full flex items-center justify-center bg-red-600 text-white">
          <PhoneOff size={14} />
        </span>
      </div>
    </div>

    {/* Floating AI summary card */}
    <div className="absolute -bottom-20 -left-2 sm:-left-8 w-52 sm:w-60 rounded-2xl bg-white p-3.5 shadow-xl ring-1 ring-black/5">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0b1f1a] mb-2">
        <Sparkles size={14} className="text-emerald-500" />
        AI chat summary
      </div>
      <ul className="space-y-1.5">
        {["w-full", "w-4/5", "w-3/5"].map((w) => (
          <li key={w} className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className={`h-2 rounded-full bg-gray-200 ${w}`} />
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default SessionPreview;
