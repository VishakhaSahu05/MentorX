const mentorsByDepartment = {
  Engineering: [
    {
      name: "Amit Sharma",
      role: "Senior Software Engineer",
      company: "Google",
    },
    { name: "Neha Verma", role: "Backend Engineer", company: "Amazon" },
    { name: "Rohit Jain", role: "Full Stack Engineer", company: "Microsoft" },
  ],
  Design: [
    { name: "Riya Kapoor", role: "UX Designer", company: "Adobe" },
    { name: "Kunal Mehta", role: "Product Designer", company: "Swiggy" },
    { name: "Ananya Singh", role: "UI Designer", company: "Zomato" },
  ],
  AI: [
    { name: "Ankit Jain", role: "Data Scientist", company: "Microsoft" },
    { name: "Pooja Singh", role: "ML Engineer", company: "OpenAI" },
    { name: "Vivek Rao", role: "AI Researcher", company: "DeepMind" },
  ],
  Startup: [
    { name: "Rahul Khanna", role: "Startup Mentor", company: "YC Alum" },
    { name: "Sneha Gupta", role: "Growth Mentor", company: "Zerodha" },
  ],
};

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1f1a] via-[#0f2d25] to-[#071612] text-white">
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">

          <div className="text-3xl font-semibold tracking-wide">
            Mentor<span className="text-emerald-400">X</span>
          </div>
          <nav className="hidden md:flex gap-8 text-base text-gray-300">
            <a className="hover:text-emerald-400 cursor-pointer">Engineering</a>
            <a className="hover:text-emerald-400 cursor-pointer">Design</a>
            <a className="hover:text-emerald-400 cursor-pointer">AI</a>
            <a className="hover:text-emerald-400 cursor-pointer">Startup</a>
          </nav>
          <div className="flex items-center gap-6">
            <button className="text-base text-gray-300 hover:text-white">
              Login
            </button>

            <button className="text-base px-5 py-2.5 rounded-full border border-white/25 hover:border-white">
              Sign up
            </button>

            <button className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black text-base font-semibold shadow-lg shadow-emerald-500/30">
              Browse mentors
            </button>
          </div>
        </div>
      </header>
      <section className="text-center mt-24 px-6">
        <h1 className="text-5xl md:text-6xl font-serif">
          1-on-1 Mentorship in <span className="text-emerald-400">Career</span>
        </h1>

        <p className="mt-6 text-gray-300 max-w-2xl mx-auto">
          Learn a new skill, launch a project, and grow your career with
          guidance from industry experts.
        </p>

        <div className="mt-10 flex max-w-xl mx-auto bg-white rounded-full overflow-hidden shadow-xl">
          <input
            className="flex-1 px-6 py-4 outline-none text-gray-800 placeholder-gray-500"
            placeholder="Search by company, skills or role"
          />
          <button className="px-8 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold">
            Find mentors
          </button>
        </div>
      </section>
      <section className="max-w-7xl mx-auto mt-28 px-6 pb-28">
        {Object.entries(mentorsByDepartment).map(([dept, mentors]) => (
          <div key={dept} className="mb-24">
            <h2 className="text-3xl font-semibold mb-10 text-emerald-400">
              {dept} Mentors
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mentors.map((mentor) => (
                <div
                  key={mentor.name}
                  className="flex items-center gap-6 bg-[#0f2f26] rounded-2xl p-6 shadow-lg hover:scale-[1.03] transition"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-xl font-bold text-emerald-400">
                    {mentor.name.charAt(0)}
                  </div>
                  <div className="flex-1">
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
    </div>
  );
}
