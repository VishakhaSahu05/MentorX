// constants.js

export const BASE_URL = "https://mentorx-backend-5xks.onrender.com";

export const SOCKET_URL = "https://mentorx-backend-5xks.onrender.com";

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
