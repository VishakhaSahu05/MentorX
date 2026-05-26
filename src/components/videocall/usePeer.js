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
  const pendingCandidatesRef = useRef([]);

  targetUserRef.current = targetUser;

  // cleanup peer
  const cleanup = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.ontrack = null;
      peerRef.current.onicecandidate = null;

      peerRef.current.close();
      peerRef.current = null;
    }

    pendingCandidatesRef.current = [];
  }, []);

  // create peer
  const createPeer = useCallback(() => {
    // remove old peer
    if (peerRef.current) {
      cleanup();
    }

    const peer = new RTCPeerConnection(ICE_SERVERS);

    console.log("Creating new peer connection");

    // ICE candidates
    peer.onicecandidate = (e) => {
      if (e.candidate) {
        console.log("Sending ICE candidate");

        socketRef.current?.emit("video-call:ice", {
          to: targetUserRef.current?._id,
          candidate: e.candidate,
        });
      }
    };

    // remote stream
    peer.ontrack = (e) => {
      console.log("REMOTE TRACK RECEIVED");
      console.log(e.streams);

      const remoteStream = e.streams[0];

      if (!remoteStream) return;

      remoteStreamRef.current = remoteStream;

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;

        setTimeout(() => {
          remoteVideoRef.current
            ?.play()
            .then(() => {
              console.log("Remote video playing");
            })
            .catch((err) => {
              console.error("Remote video play error:", err);
            });
        }, 100);
      }

      setRemoteActive(true);
    };

    // local tracks
    const stream = localStreamRef.current;

    console.log("LOCAL STREAM:", stream);

    if (stream) {
      stream.getTracks().forEach((track) => {
        console.log("Adding track:", track.kind);

        peer.addTrack(track, stream);
      });
    } else {
      console.log("No local stream found");
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

    peer.onsignalingstatechange = () => {
      console.log("Signaling state:", peer.signalingState);
    };

    peer.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", peer.iceConnectionState);
    };

    peerRef.current = peer;

    return peer;
  }, [cleanup]);

  // CREATE OFFER
  const createOffer = useCallback(async () => {
    try {
      console.log("Creating offer");

      if (peerRef.current) {
        cleanup();
      }

      const peer = createPeer();

      const offer = await peer.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await peer.setLocalDescription(offer);

      console.log("Sending offer");

      socketRef.current?.emit("video-call:offer", {
        to: targetUserRef.current?._id,
        offer,
      });
    } catch (err) {
      console.error("Create offer error:", err);
    }
  }, [createPeer, cleanup]);

  // HANDLE OFFER
  const handleOffer = useCallback(
    async ({ offer }) => {
      try {
        console.log("Received offer");

        if (peerRef.current && peerRef.current.signalingState !== "closed") {
          cleanup();
        }

        const peer = createPeer();

        await peer.setRemoteDescription(new RTCSessionDescription(offer));

        console.log("Remote description set");

        // add pending ICE candidates
        for (const candidate of pendingCandidatesRef.current) {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        }

        pendingCandidatesRef.current = [];

        const answer = await peer.createAnswer();

        await peer.setLocalDescription(answer);

        console.log("Sending answer");

        socketRef.current?.emit("video-call:answer", {
          to: targetUserRef.current?._id,
          answer,
        });
      } catch (err) {
        console.error("Handle offer error:", err);
      }
    },
    [createPeer, cleanup],
  );

  // HANDLE ANSWER
  const handleAnswer = useCallback(async ({ answer }) => {
    try {
      console.log("Received answer");

      if (!peerRef.current) {
        console.log("No peer connection found");
        return;
      }

      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(answer),
      );

      console.log("Answer remote description set");

      // flush pending candidates
      for (const candidate of pendingCandidatesRef.current) {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }

      pendingCandidatesRef.current = [];
    } catch (err) {
      console.error("Handle answer error:", err);
    }
  }, []);

  // HANDLE ICE
  const handleICE = useCallback(async ({ candidate }) => {
    try {
      console.log("Received ICE candidate");

      if (!candidate) return;

      if (peerRef.current && peerRef.current.remoteDescription) {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));

        console.log("ICE candidate added");
      } else {
        console.log("Queueing ICE candidate until remote description");

        pendingCandidatesRef.current.push(candidate);
      }
    } catch (err) {
      console.error("ICE handling error:", err);
    }
  }, []);

  return {
    createOffer,
    handleOffer,
    handleAnswer,
    handleICE,
    cleanup,
  };
}
