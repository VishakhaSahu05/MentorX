import { useRef, useState } from "react";
import { Mic, Trash2 } from "lucide-react";

const VoiceRecorder = ({
  onSend,
  iconClassName = "text-white",
  accentClassName = "bg-purple-500",
  sendButtonClassName = "bg-purple-600",
}) => {
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);

  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);

  // ================= START RECORDING =================
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      chunksRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: "audio/webm;codecs=opus",
        });

        const seconds = Math.floor(
          (Date.now() - startTimeRef.current) / 1000
        );

        if (blob.size > 1000) {
          onSend(blob, seconds); // 🔥 duration frontend se
        }

        chunksRef.current = [];
      };

      // 🔥 MOST IMPORTANT LINE (fixes 0:00)
      mediaRecorderRef.current.start(1000); // timeslice = 1s

      setRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } catch (err) {
      console.error("Mic permission error", err);
    }
  };

  // ================= STOP & SEND =================
  const stopRecording = () => {
    clearInterval(timerRef.current);

    // 🔥 force last chunk
    mediaRecorderRef.current?.requestData();
    mediaRecorderRef.current?.stop();

    mediaRecorderRef.current?.stream
      ?.getTracks()
      .forEach((track) => track.stop());

    setRecording(false);
    setDuration(0);
  };

  // ================= CANCEL =================
  const cancelRecording = () => {
    clearInterval(timerRef.current);

    mediaRecorderRef.current?.requestData();
    mediaRecorderRef.current?.stop();

    mediaRecorderRef.current?.stream
      ?.getTracks()
      .forEach((track) => track.stop());

    chunksRef.current = [];
    setRecording(false);
    setDuration(0);
  };

  return (
    <>
      {!recording ? (
        <button
          onMouseDown={startRecording}
          onTouchStart={startRecording}
          className={iconClassName}
        >
          <Mic size={22} />
        </button>
      ) : (
        /* FLOATING INSTAGRAM-STYLE BAR */
        <div
          className="absolute bottom-20 left-1/2 -translate-x-1/2
                     bg-[#111] px-5 py-3 rounded-full shadow-xl
                     flex items-center gap-4 animate-fadeIn"
        >
          {/* CANCEL */}
          <Trash2
            size={18}
            className="text-red-500 cursor-pointer"
            onClick={cancelRecording}
          />

          {/* WAVEFORM */}
          <div className="flex items-center gap-[3px]">
            {[4, 7, 5, 9, 6, 8, 5, 7].map((h, i) => (
              <span
                key={i}
                className={`w-[3px] ${accentClassName} rounded-full animate-wave`}
                style={{
                  height: `${h * 2}px`,
                  animationDelay: `${i * 0.12}s`,
                }}
              />
            ))}
          </div>

          {/* TIMER */}
          <span className="text-xs text-gray-300 w-10 text-right">
            0:{duration.toString().padStart(2, "0")}
          </span>

          {/* RELEASE TO SEND */}
          <button
            onMouseUp={stopRecording}
            onTouchEnd={stopRecording}
            className={`w-8 h-8 ${sendButtonClassName} rounded-full
                       flex items-center justify-center`}
          >
            <Mic size={14} className="text-white" />
          </button>
        </div>
      )}
    </>
  );
};

export default VoiceRecorder;
