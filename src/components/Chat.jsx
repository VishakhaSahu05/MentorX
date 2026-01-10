import React, { useEffect, useState } from "react";
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
import StudentProfile from "./StudentProfile";
import { BASE_URL } from "../utils/constant";

const Chat = () => {
  const { targetUserId } = useParams();
  const navigate = useNavigate();

  const [targetUser, setTargetUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showStudentProfile, setShowStudentProfile] = useState(false);

  // 🔥 FETCH TARGET USER
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/user/profile/${targetUserId}`,
          { withCredentials: true }
        );
        setTargetUser(res.data.user);
      } catch (err) {
        console.error("Fetch user error:", err);
        setTargetUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [targetUserId]);

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

  const handleSend = () => {
    if (!message.trim()) return;
    setMessage("");
  };

  return (
    <>
      {/* ================= CHAT WRAPPER ================= */}
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
                <p className="text-xs text-emerald-400">
                  {targetUser.role}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-white">
              <Phone size={20} />
              <Video size={20} />
              <Info size={20} />
            </div>
          </div>

          {/* ================= BODY ================= */}
          <div className="flex-1 overflow-y-auto px-6 py-6 text-center">
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

            {/* VIEW PROFILE BUTTON */}
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
                <Mic size={20} className="text-white" />
                <Plus size={20} className="text-white" />
              </>
            )}
          </div>
        </div>
      </div>

      {/* ================= STUDENT PROFILE MODAL ================= */}
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
