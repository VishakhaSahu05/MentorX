import { io } from "socket.io-client";
import { BASE_URL } from "./constant";

let socket;

export const createSocketConnection = () => {
  if (!socket) {
    socket = io(BASE_URL);

    socket.on("connect", () => {
      console.log(" Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.log("Socket error:", err.message);
    });
  }

  return socket;
};
