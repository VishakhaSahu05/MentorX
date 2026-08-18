// src/components/Chat.jsx
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
  Briefcase,
  Lightbulb,
  MessagesSquare,
} from "lucide-react";
import { useSelector } from "react-redux";

import StudentProfile from "./StudentProfile";
import VoiceRecorder from "../components/VoiceRecorder";
import VoiceBubble from "../components/VoiceBubble";
import { uploadVoice } from "../services/voiceApi";
import VideoCall from "./videocall/VideoCall";
import IncomingCallModal from "../components/IncomingCallModal";
import AiSummaryButton from "../components/AiSummaryButton"; // ✨ AI Summary
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

  // Video call states
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);

  const socketRef = useRef(null);
  const userRef = useRef(user);
  userRef.current = user;
  const messagesEndRef = useRef(null);

  const QUICK_SUGGESTIONS = [
    { key: "career", label: "Ask about career" },
    { key: "project", label: "Discuss a project" },
    { key: "interview", label: "Get interview advice" },
  ];

  const quickSuggestionIcon = (key) => {
    if (key === "career") return <Briefcase size={13} className="text-emerald-400" />;
    if (key === "project") return <MessagesSquare size={13} className="text-emerald-400" />;
    return <Lightbulb size={13} className="text-emerald-400" />;
  };

  //  FETCH TARGET USER
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

  //  FETCH OLD CHAT
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

  //  AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // SOCKET
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

    const onIncomingCall = ({ caller }) => {
      console.log("Incoming call from:", caller);
      setIncomingCall(caller);
    };

    const onRejected = () => {
      alert("Call was rejected");
      setActiveCall(null);
    };

    const onCancelled = () => {
      setIncomingCall(null);
      alert("Call was cancelled");
    };

    const onEnd = () => {
      setActiveCall(null);
      setIncomingCall(null);
    };

    socket.on("messageRecieved", onMessage);
    socket.on("video-call:incoming", onIncomingCall);
    socket.on("video-call:rejected", onRejected);
    socket.on("video-call:cancelled", onCancelled);
    socket.on("video-call:end", onEnd);

    return () => {
      socket.off("messageRecieved", onMessage);
      socket.off("video-call:incoming", onIncomingCall);
      socket.off("video-call:rejected", onRejected);
      socket.off("video-call:cancelled", onCancelled);
      socket.off("video-call:end", onEnd);
    };
  }, [userId, targetUserId]);

  //  SEND TEXT
  const handleSend = () => {
    if (!message.trim()) return;

    socketRef.current.emit("setMessage", {
      firstName: userRef.current.firstName,
      userId,
      targetUserId,
      type: "text",
      text: message,
    });

    setMessage("");
  };

  //  SEND VOICE
  const handleSendVoice = async (blob, duration) => {
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

  //  PROFILE NAVIGATION (header avatar/name click)
  const handleOpenProfile = () => {
    if (!targetUser) return;
    if (targetUser.role === "mentor") {
      navigate(`/mentor/${targetUserId}`);
    } else {
      setShowStudentProfile(true);
    }
  };

  //  VIDEO CALL HANDLERS
  const handleStartCall = () => {
    if (!targetUser || !user) return;
    setActiveCall({
      user: targetUser,
      isCaller: true,
    });
  };

  const handleAcceptCall = () => {
    if (incomingCall) {
      setActiveCall({
        user: incomingCall,
        isCaller: false,
      });
      setIncomingCall(null);
    }
  };

  const handleRejectCall = () => {
    if (incomingCall) {
      socketRef.current.emit("video-call:rejected", {
        to: incomingCall._id,
      });
      setIncomingCall(null);
    }
  };

  const handleEndCall = () => {
    if (activeCall) {
      socketRef.current.emit("video-call:end", {
        to: activeCall.user._id,
      });
    }
    setActiveCall(null);
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

      <div className="h-dvh bg-[#f4f6f5] flex justify-center sm:pt-24 sm:pb-6 sm:px-4">
        <div className="w-full sm:max-w-2xl lg:max-w-3xl h-full sm:h-[82vh] bg-black sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">

          {/* ================= HEADER ================= */}
          <div className="flex items-center justify-between gap-3 px-3 sm:px-5 py-3 sm:py-4 border-b border-white/10 shrink-0">
            {/* Left: back + avatar + name */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <ArrowLeft
                size={20}
                className="text-white cursor-pointer shrink-0"
                onClick={() => navigate(-1)}
              />

              <button
                type="button"
                onClick={handleOpenProfile}
                className="flex items-center gap-2 sm:gap-3 min-w-0 group cursor-pointer text-left rounded-lg -m-1 p-1 transition-opacity hover:opacity-80 active:opacity-70"
              >
                <img
                  src={targetUser.profilePic}
                  alt="profile"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shrink-0 transition-transform group-hover:scale-105"
                />

                <div className="min-w-0">
                  <p className="text-white font-semibold truncate text-sm sm:text-base group-hover:underline underline-offset-2">
                    {targetUser.firstName} {targetUser.lastName}
                  </p>
                  <p className="text-xs text-emerald-400">{targetUser.role}</p>
                </div>
              </button>
            </div>

            {/* Right: action icons */}
            <div className="flex items-center gap-2.5 sm:gap-3 text-white shrink-0">
              <Phone size={20} />

              <Video
                size={20}
                className="cursor-pointer hover:text-purple-400 transition-colors"
                onClick={handleStartCall}
              />

              {/* ✨ AI Summary Button */}
              <AiSummaryButton conversationId={targetUserId} />

              <Info size={20} className="hidden sm:block" />
            </div>
          </div>

          {/* ================= BODY ================= */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 hide-scrollbar">

            {messages.length === 0 ? (
              /* EMPTY STATE */
              <div className="h-full min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
                <img
                  src={targetUser.profilePic}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-4 object-cover ring-2 ring-white/10"
                  alt="profile"
                />

                <p className="text-white text-lg font-semibold">
                  {targetUser.firstName} {targetUser.lastName}
                </p>

                <p className="text-sm text-gray-400 mt-1 max-w-xs">
                  You're now connected on MentorX. Say hello to start the conversation.
                </p>

                <button
                  onClick={handleOpenProfile}
                  className="mt-4 px-6 py-2 rounded-full bg-[#262626] text-white text-sm hover:bg-[#333] transition-colors"
                >
                  View Profile
                </button>
              </div>
            ) : (
              /* MESSAGES */
              <div className="flex flex-col gap-1.5 min-h-full justify-end">
                {messages.length < 4 && (
                  /* COMPACT CONNECTED CARD — shown while the thread is still short */
                  <div className="mb-4 sm:mb-6 flex flex-col items-center text-center px-4">
                    <img
                      src={targetUser.profilePic}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover ring-2 ring-white/10 mb-3"
                      alt="profile"
                    />

                    <p className="text-white text-sm font-semibold">
                      You're connected with {targetUser.firstName}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs">
                      Start a conversation and make the most of your mentorship.
                    </p>

                    <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-sm sm:max-w-none sm:flex-nowrap sm:overflow-x-visible overflow-x-auto hide-scrollbar">
                      {QUICK_SUGGESTIONS.map(({ key, label }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setMessage(label)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1c1c1c] border border-white/10 text-gray-300 text-xs whitespace-nowrap hover:border-purple-500/40 hover:text-white transition-colors shrink-0"
                        >
                          {quickSuggestionIcon(key)}
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => {
                  const isMe = String(msg.senderId) === String(userId);
                  const prevSameSender =
                    i > 0 && String(messages[i - 1].senderId) === String(msg.senderId);

                  return (
                    <div
                      key={i}
                      className={`flex items-end gap-2 ${
                        isMe ? "justify-end" : "justify-start"
                      } ${prevSameSender ? "mt-0" : "mt-2.5"}`}
                    >
                      {!isMe && (
                        <img
                          src={targetUser.profilePic}
                          className={`w-7 h-7 rounded-full object-cover shrink-0 ${
                            prevSameSender ? "invisible" : ""
                          }`}
                          alt=""
                        />
                      )}

                      <div
                        className={`
                          px-4 py-2 rounded-2xl max-w-[80%] sm:max-w-[75%] text-sm leading-relaxed break-words
                          ${
                            isMe
                              ? "bg-purple-600 text-white rounded-br-md"
                              : "bg-[#2f2f2f] text-white rounded-bl-md"
                          }
                        `}
                      >
                        {msg.type === "text" && msg.text}
                        {msg.type === "voice" && <VoiceBubble src={msg.mediaUrl} />}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* ================= INPUT ================= */}
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-t border-white/10 flex items-center gap-2 sm:gap-3 shrink-0">
            <Camera size={20} className="text-white shrink-0" />

            <input
              type="text"
              placeholder="Message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 min-w-0 bg-[#1c1c1c] text-white rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
            />

            {message.trim() ? (
              <button
                onClick={handleSend}
                className="bg-[#6d28d9] hover:bg-[#5b21b6] p-2 rounded-full shrink-0 transition-colors"
              >
                <ArrowUp size={18} className="text-white" />
              </button>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <VoiceRecorder onSend={handleSendVoice} />
                <Plus size={20} className="text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Student Profile Modal */}
      {showStudentProfile && targetUser.role === "student" && (
        <StudentProfile
          student={targetUser}
          onClose={() => setShowStudentProfile(false)}
        />
      )}

      {/* Incoming Call Modal */}
      {incomingCall && (
        <IncomingCallModal
          caller={incomingCall}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}

      {/* Active Video Call */}
      {activeCall && (
        <VideoCall
          targetUser={activeCall.user}
          isCaller={activeCall.isCaller}
          onClose={handleEndCall}
          socketRef={socketRef}
        />
      )}
    </>
  );
};

export default Chat;
