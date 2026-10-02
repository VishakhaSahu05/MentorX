import axios from "axios";
import { BASE_URL } from "../utils/constant";

// All recording endpoints are cookie-authenticated, same as the rest of the app.
const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

/** Press Record -> asks the other participant for consent. */
export const requestRecording = async (targetUserId) => {
  const res = await client.post("/recording/request", { targetUserId });
  return res.data;
};

/** Answer a consent request. */
export const respondToRecordingConsent = async (recordingId, accept) => {
  const res = await client.post(`/recording/${recordingId}/consent`, {
    accept,
  });
  return res.data;
};

/** Stop an active recording (either participant may do this). */
export const stopRecording = async (recordingId) => {
  const res = await client.post(`/recording/${recordingId}/stop`);
  return res.data;
};

/**
 * The backend is the source of truth for recording state — used when a call
 * component mounts so a reconnecting client shows the correct REC state.
 */
export const getActiveRecording = async (targetUserId) => {
  const res = await client.get("/recording/active", {
    params: { targetUserId },
  });
  return res.data;
};

export const getRecording = async (recordingId) => {
  const res = await client.get(`/recording/${recordingId}`);
  return res.data;
};

export const listRecordings = async () => {
  const res = await client.get("/recordings");
  return res.data;
};

/** Short-lived signed URL; never a public S3 link. */
export const getRecordingDownloadUrl = async (recordingId) => {
  const res = await client.get(`/recording/${recordingId}/download`);
  return res.data;
};
