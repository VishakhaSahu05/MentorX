import { useCallback, useEffect, useRef, useState } from "react";
import {
  getActiveRecording,
  requestRecording,
  respondToRecordingConsent,
  stopRecording as stopRecordingApi,
} from "../services/recordingApi";
import { getSocket } from "../utils/socket";

/**
 * Recording state machine for a video call.
 *
 * The BACKEND is the source of truth: this hook only mirrors what the server
 * reports, either from the REST responses or from the recording:* socket
 * events. It never starts a recording locally — Agora Cloud Recording does the
 * actual capture server-side.
 *
 * states: idle | requesting | awaiting-consent | recording | stopping | processing
 */
const useCallRecording = ({ socketRef, targetUserId, currentUserId }) => {
  const [state, setState] = useState("idle");
  const [recordingId, setRecordingId] = useState(null);
  const [startedAt, setStartedAt] = useState(null);
  const [consentRequest, setConsentRequest] = useState(null); // incoming ask
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  // Kept in a ref so the socket handlers and the unmount cleanup always see the
  // current id without re-subscribing.
  const recordingIdRef = useRef(null);
  const stateRef = useRef("idle");

  useEffect(() => {
    recordingIdRef.current = recordingId;
  }, [recordingId]);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const applyServerRecording = useCallback((rec) => {
    if (!rec) {
      setState("idle");
      setRecordingId(null);
      setStartedAt(null);
      return;
    }
    setRecordingId(rec._id);
    setStartedAt(rec.startedAt || null);

    switch (rec.status) {
      case "pending": {
        // Pending means consent is outstanding. Whether we are waiting or being
        // asked is decided by who initiated.
        const iStarted = String(rec.initiator) === String(currentUserId);
        setState(iStarted ? "awaiting-consent" : "requesting");
        // If we are the one being asked, surface the modal from server state
        // too. The socket event may have been emitted before this component
        // mounted (the receiver opens the call UI a moment later), and the
        // modal only renders when consentRequest is set.
        if (!iStarted) {
          setConsentRequest({
            recordingId: rec._id,
            from: rec.initiatorUser || null,
          });
        }
        break;
      }
      case "recording":
        setState("recording");
        break;
      case "stopping":
        setState("stopping");
        break;
      case "processing":
        setState("processing");
        break;
      default:
        // declined / ready / failed are all terminal for the in-call UI
        setState("idle");
        setRecordingId(null);
        setStartedAt(null);
    }
  }, [currentUserId]);

  // On mount, ask the server whether a recording is already running for this
  // call (handles refresh / rejoin mid-recording).
  useEffect(() => {
    let cancelled = false;
    if (!targetUserId) return;

    getActiveRecording(targetUserId)
      .then((data) => {
        if (!cancelled) applyServerRecording(data.recording);
      })
      .catch(() => {
        /* no active recording, or not reachable — stay idle */
      });

    return () => {
      cancelled = true;
    };
  }, [targetUserId, applyServerRecording]);

  // Server-pushed state changes.
  //
  // The socket is resolved lazily rather than read once: socketRef is a ref, so
  // this effect never re-runs when socketRef.current is populated later. If the
  // call mounts before Chat.jsx has assigned the socket (which is what happens
  // for the participant receiving a consent request), reading it once would
  // silently register no listeners at all and the consent modal would never
  // appear. Fall back to the shared singleton socket, and retry briefly until
  // one is available.
  useEffect(() => {
    let cleanup = null;
    let cancelled = false;

    const onConsentRequest = ({ recordingId: id, from }) => {
      setRecordingId(id);
      setConsentRequest({ recordingId: id, from });
      setState("requesting");
    };

    const onStarted = ({ recordingId: id, startedAt: at }) => {
      setRecordingId(id);
      setStartedAt(at || new Date().toISOString());
      setConsentRequest(null);
      setState("recording");
      setError(null);
    };

    const onDeclined = () => {
      setConsentRequest(null);
      setRecordingId(null);
      setStartedAt(null);
      setState("idle");
    };

    const onStopping = () => setState("stopping");
    const onProcessing = () => setState("processing");

    const onReady = () => {
      setState("idle");
      setRecordingId(null);
      setStartedAt(null);
    };

    const onFailed = ({ reason }) => {
      setConsentRequest(null);
      setRecordingId(null);
      setStartedAt(null);
      setState("idle");
      setError(reason || "Recording failed");
    };

    const attach = (socket) => {
      socket.on("recording:consent-request", onConsentRequest);
      socket.on("recording:started", onStarted);
      socket.on("recording:declined", onDeclined);
      socket.on("recording:stopping", onStopping);
      socket.on("recording:processing", onProcessing);
      socket.on("recording:ready", onReady);
      socket.on("recording:failed", onFailed);

      cleanup = () => {
        socket.off("recording:consent-request", onConsentRequest);
        socket.off("recording:started", onStarted);
        socket.off("recording:declined", onDeclined);
        socket.off("recording:stopping", onStopping);
        socket.off("recording:processing", onProcessing);
        socket.off("recording:ready", onReady);
        socket.off("recording:failed", onFailed);
      };
    };

    const resolve = () => socketRef?.current || getSocket();

    const existing = resolve();
    if (existing) {
      attach(existing);
    } else {
      // Socket not ready yet — poll briefly instead of giving up for good.
      const id = setInterval(() => {
        if (cancelled) return;
        const s = resolve();
        if (s) {
          clearInterval(id);
          attach(s);
        }
      }, 200);
      cleanup = () => clearInterval(id);
    }

    return () => {
      cancelled = true;
      if (cleanup) cleanup();
    };
  }, [socketRef]);

  /** Press Record. */
  const request = useCallback(async () => {
    if (busy || stateRef.current !== "idle") return;
    setBusy(true);
    setError(null);
    try {
      const data = await requestRecording(targetUserId);
      applyServerRecording(data.recording);
    } catch (err) {
      const res = err?.response;
      if (res?.status === 409) {
        // Lost the simultaneous-press race: adopt the existing session.
        applyServerRecording(res.data?.recording);
      } else {
        setError(res?.data?.error || "Could not request recording");
      }
    } finally {
      setBusy(false);
    }
  }, [busy, targetUserId, applyServerRecording]);

  /** Accept/decline an incoming consent request. */
  const respond = useCallback(
    async (accept) => {
      const id = consentRequest?.recordingId || recordingIdRef.current;
      if (!id) return;
      setBusy(true);
      setError(null);
      try {
        const data = await respondToRecordingConsent(id, accept);
        setConsentRequest(null);
        applyServerRecording(data.recording);
      } catch (err) {
        setConsentRequest(null);
        setState("idle");
        setError(
          err?.response?.data?.error ||
            (accept ? "Could not start recording" : "Could not decline"),
        );
      } finally {
        setBusy(false);
      }
    },
    [consentRequest, applyServerRecording],
  );

  /** Stop an active recording, or cancel a pending request. */
  const stop = useCallback(async () => {
    const id = recordingIdRef.current;
    if (!id) return;
    setBusy(true);
    try {
      const data = await stopRecordingApi(id);
      applyServerRecording(data.recording);
    } catch (err) {
      setError(err?.response?.data?.error || "Could not stop recording");
    } finally {
      setBusy(false);
    }
  }, [applyServerRecording]);

  const isActive = state === "recording";
  const isPendingMine = state === "awaiting-consent";
  const isBusyState =
    state === "stopping" || state === "processing" || state === "awaiting-consent";

  return {
    state,
    recordingId,
    startedAt,
    consentRequest,
    error,
    busy,
    isActive,
    isPendingMine,
    isBusyState,
    request,
    respond,
    stop,
    clearError: () => setError(null),
  };
};

export default useCallRecording;
