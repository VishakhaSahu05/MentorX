import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { useSelector } from "react-redux";
import AgoraRTC from "agora-rtc-sdk-ng";
import { DEFAULT_PIC } from "../../utils/constant";
import { BASE_URL } from "../../utils/constant";

const VideoCall = ({ targetUser, onClose, isCaller, socketRef }) => {
  const user = useSelector((s) => s.user);
  const [remoteActive, setRemoteActive] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);

  const clientRef = useRef(null);
  const localVideoTrackRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const channelName = [user._id, targetUser._id].sort().join("_");

  useEffect(() => {
    const init = async () => {
      try {
        // Token fetch karo backend se
        const res = await fetch(
          `${BASE_URL}/api/agora-token?channelName=${channelName}&uid=0`
        );
        const { token, appId } = await res.json();

        // Agora client banao
        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        clientRef.current = client;

        // Remote user joined
        client.on("user-published", async (remoteUser, mediaType) => {
          await client.subscribe(remoteUser, mediaType);

          if (mediaType === "video") {
            remoteUser.videoTrack.play("remote-video");
            setRemoteActive(true);
          }
          if (mediaType === "audio") {
            remoteUser.audioTrack.play();
          }
        });

        client.on("user-unpublished", (remoteUser, mediaType) => {
          if (mediaType === "video") setRemoteActive(false);
        });

        // Channel join karo
        await client.join(appId, channelName, token, 0);

        // Local tracks banao
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        localAudioTrackRef.current = audioTrack;
        localVideoTrackRef.current = videoTrack;

        // Local video play karo
        videoTrack.play("local-video");

        // Publish karo
        await client.publish([audioTrack, videoTrack]);

      } catch (err) {
        console.error("Agora init error:", err);
      }
    };

    init();

    return () => {
      localVideoTrackRef.current?.close();
      localAudioTrackRef.current?.close();
      clientRef.current?.leave();
    };
  }, []);

  const toggleMic = () => {
    const track = localAudioTrackRef.current;
    if (!track) return;
    track.setEnabled(!micOn);
    setMicOn(!micOn);
  };

  const toggleVideo = () => {
    const track = localVideoTrackRef.current;
    if (!track) return;
    track.setEnabled(!cameraOn);
    setCameraOn(!cameraOn);
  };

  const handleClose = async () => {
    localVideoTrackRef.current?.close();
    localAudioTrackRef.current?.close();
    await clientRef.current?.leave();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black text-white z-50">
      <div className="absolute top-4 left-4 text-sm text-gray-300">
        {remoteActive
          ? `Connected with ${targetUser.firstName}`
          : isCaller
            ? `Calling ${targetUser.firstName}…`
            : `Incoming call from ${targetUser.firstName}…`}
      </div>

      {/* Remote video */}
      <div className="flex items-center justify-center h-full relative">
        <div
          id="remote-video"
          className={`w-full h-full ${remoteActive ? "block" : "hidden"}`}
        />
        {!remoteActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <img
              src={targetUser.profilePic || DEFAULT_PIC}
              alt={targetUser.firstName}
              className="w-32 h-32 rounded-full object-cover mb-3"
            />
            <span className="text-lg font-semibold">{targetUser.firstName}</span>
          </div>
        )}
      </div>

      {/* Local PIP */}
      <div className="absolute bottom-28 right-6 w-40 h-28 rounded-lg overflow-hidden border border-gray-600">
        {cameraOn ? (
          <div id="local-video" className="w-full h-full" />
        ) : (
          <img
            src={user.profilePic || DEFAULT_PIC}
            alt="You"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 w-full flex justify-center gap-6">
        <button
          onClick={toggleMic}
          className={`w-14 h-14 rounded-full ${micOn ? "bg-gray-700" : "bg-red-600"} flex items-center justify-center`}
        >
          {micOn ? <Mic /> : <MicOff />}
        </button>

        <button
          onClick={handleClose}
          className="w-16 h-16 rounded-full bg-red-700 flex items-center justify-center"
        >
          <PhoneOff />
        </button>

        <button
          onClick={toggleVideo}
          className={`w-14 h-14 rounded-full ${cameraOn ? "bg-gray-700" : "bg-red-600"} flex items-center justify-center`}
        >
          {cameraOn ? <Video /> : <VideoOff />}
        </button>
      </div>
    </div>
  );
};

export default VideoCall;