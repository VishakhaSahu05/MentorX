import React from "react";

const Landing = () => {
  return (
    <section className="text-center mt-24 px-6 text-white">
      <h1 className="text-5xl md:text-6xl font-serif">
        1-on-1 Mentorship in{" "}
        <span className="text-emerald-400">Career</span>
      </h1>

      <p className="mt-6 text-gray-300 max-w-2xl mx-auto">
        Learn a new skill, launch a project, and grow your career with guidance
        from industry experts.
      </p>

      {/* White search bar */}
      <div className="mt-10 flex max-w-xl mx-auto bg-white rounded-full overflow-hidden shadow-xl">
        <input
          type="text"
          placeholder="Search by company, skills or role"
          className="flex-1 px-6 py-4 outline-none text-gray-800 placeholder-gray-500"
        />
        <button className="px-8 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold">
          Find mentors
        </button>
      </div>
    </section>
  );
};

export default Landing;
