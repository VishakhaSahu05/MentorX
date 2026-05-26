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

    console.log(
      "User registered for video calls:",
      currentUser._id
    );
  }
};

export const createSocketConnection = (user = null) => {
  if (user) {
    currentUser = user;
  }

  // create socket only once
  if (!socket) {
    socket = io(BASE_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);

      registerUser();
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.log("Socket connect error:", err.message);
    });
  }

  // reconnect if disconnected
  if (socket.disconnected) {
    socket.connect();
  }

  // register again if already connected
  if (socket.connected) {
    registerUser();
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};