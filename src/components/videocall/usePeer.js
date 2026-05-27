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

  const createPeer = useCallback(async () => {
    if (peerRef.current) cleanup();

    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turns:openrelay.metered.ca:443",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
      ],
    });

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current?.emit("video-call:ice", {
          to: targetUserRef.current?._id,
          candidate: e.candidate,
        });
      }
    };

    // ✅ Fix: streams[0] nahi mila toh manually MediaStream banao
    peer.ontrack = (e) => {
      console.log("REMOTE TRACK RECEIVED", e.track.kind, e.streams);

      let remoteStream = e.streams?.[0];

      if (remoteStream) {
        remoteStreamRef.current = remoteStream;
      } else {
        if (!remoteStreamRef.current) {
          remoteStreamRef.current = new MediaStream();
        }
        remoteStreamRef.current.addTrack(e.track);
      }

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
        remoteVideoRef.current.play().catch(console.error);
      }

      setRemoteActive(true);
    };

    const stream = localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    }

    peer.onconnectionstatechange = () => {
      console.log("Connection state:", peer.connectionState);
      if (
        peer.connectionState === "failed" ||
        peer.connectionState === "disconnected" ||
        peer.connectionState === "closed"
      ) {
        cleanup();
      }
    };

    peer.oniceconnectionstatechange = () => {
      console.log("ICE state:", peer.iceConnectionState);
    };

    peerRef.current = peer;
    return peer;
  }, [cleanup]);

  const createOffer = useCallback(async () => {
    try {
      if (peerRef.current) cleanup();
      const peer = await createPeer();
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

  const handleOffer = useCallback(
    async ({ offer }) => {
      try {
        if (peerRef.current) cleanup();
        const peer = await createPeer();
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