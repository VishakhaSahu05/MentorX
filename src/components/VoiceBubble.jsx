import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

const VoiceBubble = ({ src }) => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(null);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <div className="flex items-center gap-3 bg-[#6D28D9] px-4 py-3 rounded-2xl w-[260px]">
      {/* PLAY BUTTON */}
      <button
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0"
      >
        {playing ? (
          <Pause size={18} className="text-[#6D28D9]" />
        ) : (
          <Play size={18} className="text-[#6D28D9] ml-[2px]" />
        )}
      </button>

      {/* WAVEFORM (VISUAL ONLY) */}
      <div className="flex items-center gap-[3px] flex-1">
        {[6, 10, 14, 9, 16, 11, 13, 8, 12].map((h, i) => (
          <span
            key={i}
            className="w-[3px] bg-white/90 rounded-full"
            style={{ height: `${h}px` }}
          />
        ))}
      </div>

      {/* DURATION */}
      <span className="text-xs text-white/90 min-w-[32px] text-right">
        {duration !== null ? `0:${duration.toString().padStart(2, "0")}` : "…"}
      </span>

      {/* AUDIO (HIDDEN) */}
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={() => {
          const d = Math.floor(audioRef.current.duration);
          if (Number.isFinite(d)) setDuration(d);
        }}
        onEnded={() => setPlaying(false)}
      />
    </div>
  );
};

export default VoiceBubble;
