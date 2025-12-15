import React from "react";

const Navbar = () => {
  return (
    <header className="border-b border-white/10">
      <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between text-white">
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

          <button className="px-5 py-2.5 rounded-full border border-white/25 hover:border-white">
            Sign up
          </button>

          <button className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold shadow-lg shadow-emerald-500/30">
            Browse mentors
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
