import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { X } from "lucide-react";

const StudentProfile = ({ student, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // mount closed, then flip to open next frame so the transition runs
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!student) return null;

  return ReactDOM.createPortal(
    <div
      className={`fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose} // background click = close
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${student.firstName} ${student.lastName} profile`}
        className={`relative w-full max-w-sm bg-white rounded-3xl shadow-2xl px-6 py-7 sm:px-8 sm:py-8 max-h-[85vh] overflow-y-auto transition-all duration-200 ${
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()} // card click = no close
      >
        {/* CLOSE */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10000 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X size={20} />
        </button>

        {/* PROFILE */}
        <div className="flex flex-col items-center text-center">
          <img
            src={student.profilePic}
            alt="profile"
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shrink-0 ring-4 ring-emerald-50"
          />

          <h2 className="mt-4 text-lg sm:text-xl font-semibold text-gray-900 truncate max-w-full">
            {student.firstName} {student.lastName}
          </h2>

          <span className="inline-block mt-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-medium">
            Student
          </span>

          {student.department && (
            <p className="mt-3 text-sm text-gray-500">{student.department}</p>
          )}
        </div>

        {/* SKILLS */}
        {student.skills?.length > 0 && (
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2.5">Skills</p>
            <div className="flex flex-wrap gap-2">
              {student.skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-xs font-medium bg-gray-50 border border-gray-100 text-gray-700 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ABOUT */}
        {student.about && (
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">About</p>
            <p className="text-sm text-gray-600 leading-relaxed break-words text-left">
              {student.about}
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default StudentProfile;
