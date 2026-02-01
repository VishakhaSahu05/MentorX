import { useRef, useState, useCallback } from "react";

export function useMedia() {
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  const startCamera = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localStreamRef.current = stream;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
  }, []);

  
  const setLocalVideoEl = useCallback((el) => { //el -> actual HTML video element jo DOM m hota
    localVideoRef.current = el;
    if (el && localStreamRef.current) {
      el.srcObject = localStreamRef.current;
    }
  }, []);

  const toggleVideo = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setCameraOn(track.enabled);
  };

  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMicOn(track.enabled);
  };

  return {
    localStreamRef,
    startCamera,
    setLocalVideoEl,
    cameraOn,
    micOn,
    toggleVideo,
    toggleMic,
  };
}