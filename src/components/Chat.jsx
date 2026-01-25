import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Camera,
  Mic,
  Plus,
  ArrowUp,
  Phone,
  Video,
  Info,
} from "lucide-react";
import { useSelector } from "react-redux";

import StudentProfile from "./StudentProfile";
import VoiceRecorder from "../components/VoiceRecorder";
import VoiceBubble from "../components/VoiceBubble";
import { uploadVoice } from "../services/voiceApi";
import { BASE_URL } from "../utils/constant";
import { createSocketConnection } from "../utils/socket";

const Chat = () => {
  const { targetUserId } = useParams();
  const navigate = useNavigate();

  const user = useSelector((store) => store.user);
  const userId = user?._id;

  const [targetUser, setTargetUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [showStudentProfile, setShowStudentProfile] = useState(false);

  const socketRef = useRef(null);

  // ================= FETCH TARGET USER =================
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/user/profile/${targetUserId}`,
          { withCredentials: true },
        );
        setTargetUser(res.data.user);
      } catch {
        setTargetUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [targetUserId]);

  // ================= FETCH OLD CHAT =================
  useEffect(() => {
    if (!userId) return;

    const fetchChat = async () => {
      try {
        const chat = await axios.get(`${BASE_URL}/chat/${targetUserId}`, {
          withCredentials: true,
        });

        setMessages(
          chat?.data?.messages?.map((msg) => ({
            senderId: msg.senderId?._id,
            type: msg.type || "text",
            text: msg.text,
            mediaUrl: msg.mediaUrl,
          })) || [],
        );
      } catch {}
    };

    fetchChat();
  }, [userId, targetUserId]);

  // ================= SOCKET =================
  useEffect(() => {
    if (!userId || !targetUserId) return;

    const socket = createSocketConnection();
    socketRef.current = socket;

    socket.emit("joinChat", {
      firstName: user?.firstName,
      userId,
      targetUserId,
    });

    socket.on("messageRecieved", (msg) => {
      setMessages((prev) => [
        ...prev,
        {
          senderId: String(msg.senderId),
          type: msg.type || "text",
          text: msg.text,
          mediaUrl: msg.mediaUrl,
        },
      ]);
    });

    return () => {
      socket.off("messageRecieved");
    };
  }, [userId, targetUserId]);

  // ================= SEND TEXT =================
  const handleSend = () => {
    if (!message.trim()) return;

    socketRef.current.emit("setMessage", {
      firstName: user.firstName,
      userId,
      targetUserId,
      type: "text",
      text: message,
    });

    setMessage("");
  };

  // ================= SEND VOICE =================
  const handleSendVoice = async (blob, duration) => {
    try {
      const res = await uploadVoice(blob);

      socketRef.current.emit("setMessage", {
        firstName: user.firstName,
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading chat…
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        User not found
      </div>
    );
  }

  return (
    <>
      <style>
        {`
  .hide-scrollbar {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }

  .hide-scrollbar {
    scroll-behavior: smooth;
  }
`}
      </style>
      <div className="min-h-screen bg-[#f4f6f5] flex justify-center pt-28 pb-10">
        <div className="w-full max-w-3xl h-[82vh] bg-black rounded-3xl shadow-2xl flex flex-col">
          {/* ================= HEADER ================= */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <ArrowLeft
                size={20}
                className="text-white cursor-pointer"
                onClick={() => navigate(-1)}
              />

              <img
                src={targetUser.profilePic}
                alt="profile"
                className="w-10 h-10 rounded-full object-cover"
              />

              <div>
                <p className="text-white font-semibold">
                  {targetUser.firstName} {targetUser.lastName}
                </p>
                <p className="text-xs text-emerald-400">{targetUser.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-white">
              <Phone size={20} />
              <Video size={20} />
              <Info size={20} />
            </div>
          </div>

          {/* ================= BODY ================= */}
          <div className="flex-1 overflow-y-auto px-6 py-6 hide-scrollbar">
            {/* CENTER CARD */}
            <div className="text-center mb-10">
              <img
                src={targetUser.profilePic}
                className="w-24 h-24 rounded-full mx-auto mb-4"
                alt="profile"
              />

              <p className="text-white text-lg font-semibold">
                {targetUser.firstName} {targetUser.lastName}
              </p>

              <p className="text-sm text-gray-400 mt-1">
                You’re now connected on MentorX
              </p>

              <button
                onClick={() => {
                  if (targetUser.role === "mentor") {
                    navigate(`/mentor/${targetUserId}`);
                  } else {
                    setShowStudentProfile(true);
                  }
                }}
                className="mt-4 px-6 py-2 rounded-full bg-[#262626] text-white text-sm hover:bg-[#333]"
              >
                View Profile
              </button>
            </div>

            {/* MESSAGES */}
            <div className="flex flex-col gap-2">
              {messages.map((msg, i) => {
                const isMe = String(msg.senderId) === String(userId);

                return (
                  <div
                    key={i}
                    className={`flex items-end gap-2 ${
                      isMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isMe && (
                      <img
                        src={targetUser.profilePic}
                        className="w-7 h-7 rounded-full object-cover"
                        alt=""
                      />
                    )}

                    <div
                      className={`
                        px-4 py-2 rounded-2xl max-w-[75%] text-sm leading-relaxed
                        ${
                          isMe
                            ? "bg-purple-600 text-white rounded-br-md"
                            : "bg-[#2f2f2f] text-white rounded-bl-md"
                        }
                      `}
                    >
                      {msg.type === "text" && msg.text}

                      {msg.type === "voice" && (
                        <VoiceBubble src={msg.mediaUrl} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================= INPUT ================= */}
          <div className="px-4 py-3 border-t border-white/10 flex items-center gap-3">
            <Camera size={20} className="text-white" />

            <input
              type="text"
              placeholder="Message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-[#1c1c1c] text-white rounded-full px-4 py-2 outline-none"
            />

            {message.trim() ? (
              <button
                onClick={handleSend}
                className="bg-[#6d28d9] p-2 rounded-full"
              >
                <ArrowUp size={18} className="text-white" />
              </button>
            ) : (
              <>
                <VoiceRecorder onSend={handleSendVoice} />
                <Plus size={20} className="text-white" />
              </>
            )}
          </div>
        </div>
      </div>

      {showStudentProfile && targetUser.role === "student" && (
        <StudentProfile
          student={targetUser}
          onClose={() => setShowStudentProfile(false)}
        />
      )}
    </>
  );
};

export default Chat;
