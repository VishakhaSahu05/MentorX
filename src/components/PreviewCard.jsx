import React from "react";

const PreviewCard = ({
  firstName,
  lastName,
  department,
  skills,
  experience,
  profilePic,
}) => {
  return (
    <div className="w-full max-w-sm bg-[#0f2f26] rounded-2xl border border-white/5 p-5 sm:p-6 shadow-lg text-white min-h-80 overflow-hidden">
      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400/80 mb-4">
        Live Feed Preview
      </p>

      <div className="flex items-center gap-4 pb-4 border-b border-white/10">
        <img
          src={profilePic || "/default-avatar.png"}
          alt="profile"
          onError={(e) => {
            e.currentTarget.src = "/default-avatar.png";
          }}
          className="w-14 h-14 rounded-full object-cover border border-white/20 shrink-0"
        />

        <div className="min-w-0">
          <h2 className="text-lg font-semibold truncate">
            {firstName || "First"} {lastName || "Last"}
          </h2>
          <p className="text-sm text-gray-400 truncate">
            {department || "Department"}
          </p>
        </div>
      </div>

      <div className="py-4 space-y-3 border-b border-white/10">
        <div>
          <p className="text-xs text-gray-500 mb-1">Skills</p>
          <p className="text-sm text-gray-200 line-clamp-2">
            {skills || "Your skills will appear here"}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">Experience</p>
          <p className="text-sm text-gray-200 line-clamp-2">
            {experience || "Your experience"}
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button className="flex-1 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black text-sm font-semibold transition-colors">
          View Profile
        </button>
        <button className="flex-1 py-2 rounded-full border border-white/30 text-sm hover:bg-white/10 transition-colors">
          Connect
        </button>
      </div>
    </div>
  );
};

export default PreviewCard;
