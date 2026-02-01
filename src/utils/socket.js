import { io } from "socket.io-client";
import { BASE_URL } from "./constant";

let socket = null;
let currentUser = null;

const registerUser = () => {
  if (socket?.connected && currentUser) {
    socket.emit("user:register", {
      userId: currentUser._id,
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      profilePic: currentUser.profilePic,
    });
    console.log("User registered for video calls:", currentUser._id);
  }
};

export const createSocketConnection = (userId = null, user = null) => {
  if (user) {
    currentUser = user;
  }

  if (socket && socket.disconnected) {
    socket.connect();
  }

  if (!socket) {
    socket = io(BASE_URL);

    // fires on EVERY connect/reconnect — handles Vite HMR, page refresh, network drop
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      registerUser();
    });

    socket.on("connect_error", (err) => {
      console.log("Socket error:", err.message);
    });
  } else if (socket.connected) {
    registerUser();
  }

  return socket;
};

export const getSocket = () => socket;