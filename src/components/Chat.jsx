import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  Phone,
  Video,
  Info,
  Camera,
  Mic,
  Plus,
} from "lucide-react";

const Chat = () => {
  const { targetUserId } = useParams();
  const navigate = useNavigate();

  // Logged-in user (future use)
  const loggedInUser = useSelector((store) => store.user);

  // Connections from redux
  const connections = useSelector(
    (store) => store.connection?.connections || []
  );

  // Find chat user ONLY after connections load
  const targetUser = connections.length
    ? connections.find((u) => u._id === targetUserId)
    : null;

  // Wait till connections load
  if (!connections.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading chat...</p>
      </div>
    );
  }

  // Not a connection
  if (!targetUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          You can only chat with your connections
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f5] flex justify-center pt-28 pb-10">
      {/* CHAT BOX */}
      <div className="w-full max-w-3xl h-[82vh] bg-black rounded-3xl shadow-2xl flex flex-col overflow-hidden">

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
              <p className="text-xs text-emerald-400">online</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-white">
            <Phone size={20} className="cursor-pointer" />
            <Video size={20} className="cursor-pointer" />
            <Info size={20} className="cursor-pointer" />
          </div>
        </div>

        {/* ================= BODY ================= */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <img
            src={targetUser.profilePic}
            className="w-28 h-28 rounded-full object-cover mb-4"
          />

          <p className="text-white text-lg font-semibold">
            {targetUser.firstName} {targetUser.lastName}
          </p>

          <p className="text-sm text-gray-400 mt-1">
            You’re now connected on MentorX
          </p>

          <button
            onClick={() => navigate(`/mentor/${targetUserId}`)}
            className="mt-4 px-6 py-2 rounded-full bg-[#262626] text-white text-sm hover:bg-[#333] transition"
          >
            View Profile
          </button>

          <p className="mt-6 text-sm text-gray-500">Say hi 👋</p>
        </div>

        {/* ================= INPUT ================= */}
        <div className="px-4 py-3 border-t border-white/10 flex items-center gap-3">
          <Camera size={20} className="text-white cursor-pointer" />

          <input
            type="text"
            placeholder="Message..."
            className="flex-1 bg-[#1c1c1c] text-white rounded-full px-4 py-2 outline-none placeholder-gray-500"
          />

          <Mic size={20} className="text-white cursor-pointer" />
          <Plus size={20} className="text-white cursor-pointer" />
        </div>
      </div>
    </div>
  );
};

export default Chat;
