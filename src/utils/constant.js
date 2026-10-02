// constants.js

// Vercel Preview / staging sets VITE_API_BASE_URL to point at the staging
// backend. Production leaves it unset and keeps using the URL below.
export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://mentorx-backend-5xks.onrender.com";

// Sockets talk to the same origin as the API — derived so there is only one
// place to configure the backend URL.
export const SOCKET_URL = BASE_URL;

// utils/constant.js
export const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    {
      urls: "turn:YOUR_TURN_SERVER.metered.live:80",
      username: "YOUR_USERNAME",
      credential: "YOUR_CREDENTIAL",
    },
    {
      urls: "turn:YOUR_TURN_SERVER.metered.live:443",
      username: "YOUR_USERNAME",
      credential: "YOUR_CREDENTIAL",
    },
    {
      urls: "turns:YOUR_TURN_SERVER.metered.live:443", // TLS over 443
      username: "YOUR_USERNAME",
      credential: "YOUR_CREDENTIAL",
    },
  ],
};
export const DEFAULT_PIC =
  "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png";
