import { io } from "socket.io-client";
import { BASE_URL } from "./constant";

let socket = null;
let currentUser = null;

const emitRegisterEvent = () => {
  if (!socket) {
    console.log("Socket not initialized");
    return;
  }

  if (!socket.connected) {
    console.log("Socket not connected");
    return;
  }

  if (!currentUser?._id) {
    console.log("Current user missing");
    return;
  }

  socket.emit("user:register", {
    userId: String(currentUser._id),
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    profilePic: currentUser.profilePic,
  });

  console.log("USER REGISTERED:", currentUser._id);
};

export const createSocketConnection = (user) => {
  if (user) {
    currentUser = user;
  }

  if (!socket) {
    socket = io(BASE_URL, {
      transports: ["websocket"],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);

      emitRegisterEvent();
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.log("Socket connect error:", err.message);
    });
  }

  if (socket.connected) {
    emitRegisterEvent();
  }

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentUser = null;

    console.log("Socket manually disconnected");
  }
};