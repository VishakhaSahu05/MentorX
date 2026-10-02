import React, { useEffect, useState } from "react";

const formatElapsed = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

/**
 * Persistent "● REC" badge. Shown to BOTH participants for the whole time the
 * cloud recording is running, so nobody can be recorded without seeing it.
 */
const RecordingIndicator = ({ startedAt, state }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (state !== "recording") return;
    const base = startedAt ? new Date(startedAt).getTime() : Date.now();
    const tick = () =>
      setElapsed(Math.max(0, Math.floor((Date.now() - base) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt, state]);

  const label =
    state === "requesting"
      ? "Waiting for consent…"
      : state === "stopping"
        ? "Finishing recording…"
        : state === "processing"
          ? "Processing recording…"
          : `REC ${formatElapsed(elapsed)}`;

  const isLive = state === "recording";

  return (
    <div
      className="absolute top-4 left-4 z-[9998] flex items-center gap-2 px-3 py-1.5
                 rounded-full bg-black/70 backdrop-blur border border-white/10
                 text-xs font-semibold text-white select-none pointer-events-none"
    >
      <span
        className={`w-2.5 h-2.5 rounded-full ${
          isLive ? "bg-red-500 animate-pulse" : "bg-amber-400"
        }`}
      />
      {label}
    </div>
  );
};

export default RecordingIndicator;
