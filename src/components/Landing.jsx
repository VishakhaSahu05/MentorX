import { mentorsByDepartment } from "../data/mentors";

const Landing = () => {
  const departmentCount = Object.keys(mentorsByDepartment).length;
  const mentorCount = Object.values(mentorsByDepartment).reduce(
    (sum, list) => sum + list.length,
    0,
  );
  return (
    <section className="w-full bg-[#eefaf5] pt-24 sm:pt-28 lg:pt-32 pb-10 sm:pb-12 lg:pb-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-[#0b1f1a] leading-tight">
          1-on-1 Mentorship in{" "}
          <span className="text-emerald-500">Career</span>
        </h1>

        <p className="mt-4 sm:mt-6 text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
          Learn a new skill, launch a project, and grow your career with guidance
          from industry experts.
        </p>

        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row max-w-xl mx-auto bg-white rounded-2xl sm:rounded-full overflow-hidden shadow-lg">
          <input
            type="text"
            placeholder="Search by company, skills or role"
            className="flex-1 min-w-0 px-5 sm:px-6 py-3.5 sm:py-4 outline-none text-gray-800 text-sm sm:text-base"
          />
          <button className="px-6 sm:px-8 py-3.5 sm:py-0 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold transition-colors">
            Find mentors
          </button>
        </div>

        <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-500">
          <span><span className="font-semibold text-[#0b1f1a]">{departmentCount}</span> domains</span>
          <span className="hidden sm:inline text-gray-300">•</span>
          <span><span className="font-semibold text-[#0b1f1a]">{mentorCount}+</span> mentors</span>
        </div>

      </div>
    </section>
  );
};

export default Landing;
