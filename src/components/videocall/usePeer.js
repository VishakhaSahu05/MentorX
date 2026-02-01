import { useRef, useCallback } from "react";
import { ICE_SERVERS } from "../../utils/constant";

export function usePeer({
  socketRef,
  localStreamRef,
  remoteVideoRef,
  remoteStreamRef,
  targetUser,
  setRemoteActive,
}) {
  const peerRef = useRef(null);
  const targetUserRef = useRef(targetUser);
  targetUserRef.current = targetUser;

  const cleanup = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
  }, []);

  const createPeer = useCallback(() => {
    // close any leftover peer from a previous mount
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    const peer = new RTCPeerConnection(ICE_SERVERS);

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current.emit("video-call:ice", {
          to: targetUserRef.current._id,
          candidate: e.candidate,
        });
      }
    };

    peer.ontrack = (e) => {
      remoteStreamRef.current = e.streams[0];
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
        remoteVideoRef.current.play().catch(console.error);
      }


      setRemoteActive(true);
    };

    //
    const stream = localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => peer.addTrack(t, stream));
    }

    peerRef.current = peer;
    return peer;
  }, []);

  const createOffer = useCallback(async () => {
    if (peerRef.current) return; 

    const peer = createPeer();
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socketRef.current.emit("video-call:offer", {
      to: targetUserRef.current._id,
      offer,
    });
  }, []);

  const handleOffer = useCallback(async ({ offer }) => {
    if (peerRef.current) return;

    const peer = createPeer();
    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socketRef.current.emit("video-call:answer", {
      to: targetUserRef.current._id,
      answer,
    });
  }, []);

  const handleAnswer = useCallback(async ({ answer }) => {
    await peerRef.current?.setRemoteDescription(
      new RTCSessionDescription(answer),
    );
  }, []);

  const handleICE = useCallback(async ({ candidate }) => {
    await peerRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
  }, []);

  return { createOffer, handleOffer, handleAnswer, handleICE, cleanup };
}