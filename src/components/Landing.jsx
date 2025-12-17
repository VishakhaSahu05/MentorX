const Landing = () => {
  return (
    <section className="w-full bg-[#eefaf5] pt-48 pb-28">
      <div className="max-w-6xl mx-auto px-6 text-center">

        <h1 className="text-5xl md:text-6xl font-serif text-[#0b1f1a]">
          1-on-1 Mentorship in{" "}
          <span className="text-emerald-500">Career</span>
        </h1>

        <p className="mt-6 text-gray-600 max-w-2xl mx-auto">
          Learn a new skill, launch a project, and grow your career with guidance
          from industry experts.
        </p>

        <div className="mt-10 flex max-w-xl mx-auto bg-white rounded-full overflow-hidden shadow-lg">
          <input
            type="text"
            placeholder="Search by company, skills or role"
            className="flex-1 px-6 py-4 outline-none text-gray-800"
          />
          <button className="px-8 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold">
            Find mentors
          </button>
        </div>

      </div>
    </section>
  );
};

export default Landing;
