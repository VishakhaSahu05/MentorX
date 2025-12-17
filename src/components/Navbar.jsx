import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const Navbar = () => {
  const user = useSelector((store) => store.user);
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b1f1a]/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between text-white">

        {/* Logo */}
        <Link to="/" className="text-3xl font-semibold tracking-wide">
          Mentor<span className="text-emerald-400">X</span>
        </Link>

        {/* Center links */}
        <nav className="hidden md:flex gap-10 text-lg text-gray-300">
          <span className="hover:text-emerald-400 cursor-pointer">Engineering</span>
          <span className="hover:text-emerald-400 cursor-pointer">Design</span>
          <span className="hover:text-emerald-400 cursor-pointer">AI</span>
          <span className="hover:text-emerald-400 cursor-pointer">Startup</span>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-6 relative">

          {/* BEFORE LOGIN */}
          {!user && (
            <>
              <Link to="/login" className="text-lg text-gray-300 hover:text-white">
                Login
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2.5 text-lg rounded-full border border-white/30 hover:border-white"
              >
                Sign up
              </Link>
            </>
          )}

          {/* AFTER LOGIN */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-3 focus:outline-none"
              >
                <span className="text-sm text-gray-300 hidden sm:block">
                  Hi,{" "}
                  <span className="text-white font-medium">
                    {user.firstName}
                  </span>
                </span>

                <img
                  src={user.profilePic || "/default-avatar.png"}
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover border border-white/20"
                />
              </button>

              {/* Dropdown ONLY UI */}
              {open && (
                <div className="absolute right-0 mt-3 w-48 rounded-xl bg-[#0f2f26] border border-white/10 shadow-xl overflow-hidden">
                  <Link
                    to="/connections"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/10"
                  >
                    Connections
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/10"
                  >
                    Profile
                  </Link>

                  <span
                    className="block px-4 py-3 text-sm text-red-400 hover:bg-white/10 cursor-pointer"
                  >
                    Logout
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Common CTA */}
          <Link
            to="/"
            className="px-6 py-3 text-lg rounded-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold shadow-lg shadow-emerald-500/30"
          >
            Browse mentors
          </Link>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
