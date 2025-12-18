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
    <div className="w-full max-w-sm bg-[#0f2f26] rounded-2xl p-6 shadow-lg text-white h-80 overflow-hidden">
      <p className="text-xs uppercase tracking-wide text-gray-400 mb-4">
        Live Feed Preview
      </p>

      <div className="flex items-center gap-4 mb-4">
        <img
          src={profilePic || "/default-avatar.png"}
          alt="profile"
          onError={(e) => {
            e.currentTarget.src = "/default-avatar.png";
          }}
          className="w-14 h-14 rounded-full object-cover border border-white/20"
        />

        <div>
          <h2 className="text-lg font-semibold">
            {firstName || "First"} {lastName || "Last"}
          </h2>
          <p className="text-sm text-gray-400">
            {department || "Department"}
          </p>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-xs text-gray-400 mb-1">Skills</p>
        <p className="text-sm text-gray-200 line-clamp-2">
          {skills || "Your skills will appear here"}
        </p>
      </div>

      <div className="mb-4">
        <p className="text-xs text-gray-400 mb-1">Experience</p>
        <p className="text-sm text-gray-200 line-clamp-2">
          {experience || "Your experience"}
        </p>
      </div>

      <div className="flex gap-3">
        <button className="flex-1 py-2 rounded-full bg-emerald-500 text-black text-sm font-semibold">
          View Profile
        </button>
        <button className="flex-1 py-2 rounded-full border border-white/30 text-sm hover:bg-white/10">
          Connect
        </button>
      </div>
    </div>
  );
};

export default PreviewCard;
