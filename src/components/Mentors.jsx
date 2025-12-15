import React from "react";
import { mentorsByDepartment } from "../data/mentors";

const Mentors = () => {
  return (
    <section className="max-w-7xl mx-auto mt-28 px-6 pb-28 text-white">
      {Object.entries(mentorsByDepartment).map(([dept, mentors]) => (
        <div key={dept} className="mb-24">

          {/* Department heading */}
          <h2 className="text-3xl font-semibold mb-10 text-emerald-400">
            {dept} Mentors
          </h2>

          {/* Mentor cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mentors.map((mentor) => (
              <div
                key={mentor.name}
                className="flex items-center gap-6 bg-[#0f2f26] rounded-2xl p-6 shadow-lg hover:scale-[1.03] transition"
              >
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-xl font-bold text-emerald-400">
                  {mentor.name.charAt(0)}
                </div>

                {/* Info */}
                <div>
                  <h3 className="text-xl font-semibold">{mentor.name}</h3>
                  <p className="text-gray-300">{mentor.role}</p>
                  <p className="text-sm text-gray-400">{mentor.company}</p>

                  <button className="mt-4 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black text-sm font-semibold">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      ))}
    </section>
  );
};

export default Mentors;
