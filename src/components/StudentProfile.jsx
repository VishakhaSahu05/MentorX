import React from "react";
import ReactDOM from "react-dom";
import { X } from "lucide-react";

const StudentProfile = ({ student, onClose }) => {
  if (!student) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70"
      onClick={onClose}   // background click = close
    >
      <div
        className="relative w-full max-w-md bg-[#111] rounded-2xl p-6 text-white"
        onClick={(e) => e.stopPropagation()} // modal click = no close
      >
        {/* CLOSE */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-[10000] p-1 rounded-full hover:bg-white/10"
        >
          <X size={22} />
        </button>

        {/* PROFILE */}
        <div className="flex items-center gap-4">
          <img
            src={student.profilePic}
            alt="profile"
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <h2 className="text-xl font-semibold">
              {student.firstName} {student.lastName}
            </h2>
            <p className="text-sm text-gray-400">
              {student.department} · Student
            </p>
          </div>
        </div>

        {/* ABOUT */}
        {student.about && (
          <p className="mt-4 text-sm text-gray-300">
            {student.about}
          </p>
        )}

        {/* SKILLS */}
        {student.skills?.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-400 mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {student.skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-xs bg-[#262626] rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default StudentProfile;
