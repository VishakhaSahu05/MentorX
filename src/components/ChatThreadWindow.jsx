import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Send, Maximize2 } from "lucide-react";
import { useSelector } from "react-redux";
import { BASE_URL } from "../utils/constant";
import { createSocketConnection } from "../utils/socket";
import VoiceBubble from "./VoiceBubble";
import VoiceRecorder from "./VoiceRecorder";
import { uploadVoice } from "../services/voiceApi";

// Compact in-panel version of Chat.jsx's thread view — same data/socket
// contract (GET /chat/:id, joinChat/setMessage/messageRecieved), sized for
// the floating LinkedIn-style dock instead of the full-page chat route.
const ChatThreadWindow = ({ targetUser, onBack }) => {
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);
  const userId = user?._id;
  const targetUserId = targetUser?._id;

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const socketRef = useRef(null);
  const userRef = useRef(user);
  userRef.current = user;
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!userId || !targetUserId) return;
    let cancelled = false;

    const fetchChat = async () => {
      setLoading(true);
      try {
        const chat = await axios.get(`${BASE_URL}/chat/${targetUserId}`, {
          withCredentials: true,
        });

        if (cancelled) return;
        setMessages(
          chat?.data?.messages?.map((msg) => ({
            senderId: msg.senderId?._id,
            type: msg.type || "text",
            text: msg.text,
            mediaUrl: msg.mediaUrl,
          })) || []
        );
      } catch {
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchChat();
    return () => {
      cancelled = true;
    };
  }, [userId, targetUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!userId || !targetUserId) return;

    const socket = createSocketConnection(userRef.current);
    socketRef.current = socket;

    socket.emit("joinChat", {
      firstName: userRef.current?.firstName,
      userId,
      targetUserId,
    });

    const onMessage = (msg) => {
      setMessages((prev) => [
        ...prev,
        {
          senderId: String(msg.senderId),
          type: msg.type || "text",
          text: msg.text,
          mediaUrl: msg.mediaUrl,
        },
      ]);
    };

    socket.on("messageRecieved", onMessage);
    return () => socket.off("messageRecieved", onMessage);
  }, [userId, targetUserId]);

  const handleSend = () => {
    if (!message.trim() || !socketRef.current) return;

    socketRef.current.emit("setMessage", {
      firstName: userRef.current.firstName,
      userId,
      targetUserId,
      type: "text",
      text: message,
    });

    setMessage("");
  };

  const handleSendVoice = async (blob, duration) => {
    if (!socketRef.current) return;
    try {
      const res = await uploadVoice(blob);
      socketRef.current.emit("setMessage", {
        firstName: userRef.current.firstName,
        userId,
        targetUserId,
        type: "voice",
        mediaUrl: res.audioUrl,
        duration,
      });
    } catch {
      console.log("voice failed");
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-b border-gray-200 shrink-0 bg-white rounded-t-xl">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBack}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 shrink-0"
            aria-label="Back to conversations"
          >
            <ArrowLeft size={18} />
          </button>
          <img
            src={targetUser.profilePic || "/default-avatar.png"}
            alt=""
            className="w-7 h-7 rounded-full object-cover shrink-0"
          />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-gray-900 truncate leading-tight">
              {targetUser.firstName} {targetUser.lastName}
            </p>
            <p className="text-[10.5px] text-emerald-600 capitalize leading-none mt-0.5">
              {targetUser.role}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(`/chat/${targetUserId}`)}
          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 shrink-0"
          title="Open full chat"
        >
          <Maximize2 size={15} />
        </button>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 bg-[#f4f6f5]">
        {loading ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">
            Loading…
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <img
              src={targetUser.profilePic || "/default-avatar.png"}
              className="w-14 h-14 rounded-full object-cover mb-3 ring-2 ring-emerald-100"
              alt=""
            />
            <p className="text-[13px] font-semibold text-gray-800">
              {targetUser.firstName} {targetUser.lastName}
            </p>
            <p className="text-[11.5px] text-gray-500 mt-1 max-w-[200px]">
              You're connected on MentorX. Say hello to start the conversation.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {messages.map((msg, i) => {
              const isMe = String(msg.senderId) === String(userId);

              if (msg.type === "voice") {
                return (
                  <div
                    key={i}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div className="scale-90 origin-right -my-1">
                      <VoiceBubble
                        src={msg.mediaUrl}
                        bubbleClassName="bg-emerald-600"
                        iconColorClassName="text-emerald-600"
                      />
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={i}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`px-3 py-1.5 rounded-2xl max-w-[75%] text-[13px] leading-snug break-words ${
                      isMe
                        ? "bg-emerald-600 text-white rounded-br-md"
                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* INPUT */}
      <div className="relative px-2.5 py-2 border-t border-gray-200 bg-white rounded-b-xl shrink-0 flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Write a message…"
          className="flex-1 min-w-0 bg-gray-100 rounded-full px-3.5 py-1.5 text-[13px] outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
        />

        {message.trim() ? (
          <button
            onClick={handleSend}
            className="p-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 transition-colors"
            aria-label="Send message"
          >
            <Send size={15} />
          </button>
        ) : (
          <div className="shrink-0 text-gray-500">
            <VoiceRecorder
              onSend={handleSendVoice}
              iconClassName="text-gray-500 hover:text-emerald-600 transition-colors"
              accentClassName="bg-emerald-500"
              sendButtonClassName="bg-emerald-600"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatThreadWindow;
