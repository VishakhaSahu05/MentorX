import React from "react";
import { mentorsByDepartment } from "../data/mentors";

const Mentors = () => {
  return (
    <section className="bg-[#eefaf5] pt-4 pb-16 sm:pb-20 lg:pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-white">

        {Object.entries(mentorsByDepartment).map(([dept, mentors]) => (
          <div key={dept} className="mb-12 sm:mb-16 lg:mb-20">

            {/* Department heading */}
            <div className="flex items-baseline justify-between mb-5 sm:mb-6">
              <h2 className="text-2xl sm:text-3xl font-semibold text-emerald-600">
                {dept} Mentors
              </h2>
              <span className="text-xs sm:text-sm text-gray-500">{mentors.length} mentors</span>
            </div>

            {/* Mentor cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {mentors.map((mentor) => (
                <div
                  key={mentor.name}
                  className="flex items-start gap-4 bg-[#0f2f26] rounded-2xl border border-white/5 p-5 shadow-lg hover:shadow-xl hover:border-emerald-500/20 transition-all"
                >
                  {/* Avatar */}
                  <div className="w-14 h-14 shrink-0 rounded-full bg-emerald-500/20 flex items-center justify-center text-lg font-bold text-emerald-400">
                    {mentor.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-white truncate">
                      {mentor.name}
                    </h3>
                    <p className="text-gray-300 text-sm truncate">{mentor.role}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-gray-400 truncate">{mentor.company}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-xs text-emerald-400/90 font-medium shrink-0">{mentor.experience}</span>
                    </div>

                    <button className="mt-3 px-4 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-semibold transition-colors">
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ))}

      </div>
    </section>
  );
};

export default Mentors;
