// constants.js

export const BASE_URL = import.meta.env.VITE_BASE_URL;

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const DEFAULT_PIC =
  "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png";