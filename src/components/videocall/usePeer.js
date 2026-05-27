import { useRef, useCallback } from "react";

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
  const pendingCandidatesRef = useRef([]);

  targetUserRef.current = targetUser;

  const cleanup = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.ontrack = null;
      peerRef.current.onicecandidate = null;
      peerRef.current.close();
      peerRef.current = null;
    }
    pendingCandidatesRef.current = [];
  }, []);

  // ✅ UPDATED: async + TURN credentials fetch
  const createPeer = useCallback(async () => {
    if (peerRef.current) cleanup();

    // Backend se ICE servers fetch karo
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/ice-servers`
    );
    const iceServers = await res.json();

    const peer = new RTCPeerConnection({ iceServers });

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current?.emit("video-call:ice", {
          to: targetUserRef.current?._id,
          candidate: e.candidate,
        });
      }
    };

    peer.ontrack = (e) => {
      const remoteStream = e.streams[0];
      if (!remoteStream) return;
      remoteStreamRef.current = remoteStream;
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
        setTimeout(() => {
          remoteVideoRef.current?.play().catch(console.error);
        }, 100);
      }
      setRemoteActive(true);
    };

    const stream = localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    }

    peer.onconnectionstatechange = () => {
      if (
        peer.connectionState === "failed" ||
        peer.connectionState === "disconnected" ||
        peer.connectionState === "closed"
      ) {
        cleanup();
      }
    };

    peerRef.current = peer;
    return peer; // ✅ return karna zaroori hai
  }, [cleanup]);

  // ✅ UPDATED: await createPeer()
  const createOffer = useCallback(async () => {
    try {
      if (peerRef.current) cleanup();
      const peer = await createPeer(); // await added
      const offer = await peer.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await peer.setLocalDescription(offer);
      socketRef.current?.emit("video-call:offer", {
        to: targetUserRef.current?._id,
        offer,
      });
    } catch (err) {
      console.error("Create offer error:", err);
    }
  }, [createPeer, cleanup]);

  // ✅ UPDATED: await createPeer()
  const handleOffer = useCallback(
    async ({ offer }) => {
      try {
        if (peerRef.current) cleanup();
        const peer = await createPeer(); // await added
        await peer.setRemoteDescription(new RTCSessionDescription(offer));

        for (const candidate of pendingCandidatesRef.current) {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        }
        pendingCandidatesRef.current = [];

        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socketRef.current?.emit("video-call:answer", {
          to: targetUserRef.current?._id,
          answer,
        });
      } catch (err) {
        console.error("Handle offer error:", err);
      }
    },
    [createPeer, cleanup]
  );

  // handleAnswer & handleICE same rahenge
  const handleAnswer = useCallback(async ({ answer }) => {
    try {
      if (!peerRef.current) return;
      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      for (const candidate of pendingCandidatesRef.current) {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
      pendingCandidatesRef.current = [];
    } catch (err) {
      console.error("Handle answer error:", err);
    }
  }, []);

  const handleICE = useCallback(async ({ candidate }) => {
    try {
      if (!candidate) return;
      if (peerRef.current && peerRef.current.remoteDescription) {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        pendingCandidatesRef.current.push(candidate);
      }
    } catch (err) {
      console.error("ICE handling error:", err);
    }
  }, []);

  return { createOffer, handleOffer, handleAnswer, handleICE, cleanup };
}