import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { Menu, X } from "lucide-react";
import { removeUser } from "../utils/userSlice";
import { BASE_URL } from "../utils/constant";

const Navbar = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${BASE_URL}/logout`,
        {},
        { withCredentials: true }
      );
      dispatch(removeUser());
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const handleBrowseMentors = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role === "student") {
      navigate("/feed");
    }
  };

  const handleDashboard = () => {
    navigate("/mentor/dashboard");
  };

  const ctaBase =
    "px-5 lg:px-6 py-2.5 lg:py-3 text-base lg:text-lg rounded-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold shadow-lg shadow-emerald-500/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1f1a]";

  return (
    <header className="fixed top-0 left-0 w-full z-50 border-b border-white/10 bg-[#0b1f1a]/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-5 flex items-center justify-between text-white gap-4">

        {/* LOGO */}
        <Link to="/" className="text-2xl lg:text-3xl font-semibold tracking-wide shrink-0">
          Mentor<span className="text-emerald-400">X</span>
        </Link>

        {/* CENTER LINKS */}
        <nav className="hidden lg:flex gap-10 text-lg text-gray-300">
          <span className="hover:text-emerald-400 cursor-pointer transition-colors">Engineering</span>
          <span className="hover:text-emerald-400 cursor-pointer transition-colors">Design</span>
          <span className="hover:text-emerald-400 cursor-pointer transition-colors">AI</span>
          <span className="hover:text-emerald-400 cursor-pointer transition-colors">Startup</span>
        </nav>

        {/* RIGHT SIDE (DESKTOP) */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6 relative">

          {/* BEFORE LOGIN */}
          {!user && (
            <>
              <Link
                to="/login"
                className="text-base lg:text-lg text-gray-300 hover:text-white transition-colors"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="px-4 lg:px-5 py-2 lg:py-2.5 text-base lg:text-lg rounded-full border border-white/30 hover:border-white transition-colors"
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
                className="flex items-center gap-3 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <span className="text-sm text-gray-300 hidden lg:block">
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

              {open && (
                <div className="absolute right-0 mt-3 w-48 rounded-xl bg-[#0f2f26] border border-white/10 shadow-xl overflow-hidden">

                  {/* 🔥 REQUESTS (ONLY FOR MENTOR) */}
                  {user.role === "mentor" && (
                    <Link
                      to="/requests"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/10 transition-colors"
                    >
                      Requests
                    </Link>
                  )}

                  <Link
                    to="/connections"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/10 transition-colors"
                  >
                    Connections
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/10 transition-colors"
                  >
                    Profile
                  </Link>

                  <span
                    onClick={handleLogout}
                    className="block px-4 py-3 text-sm text-red-400 hover:bg-white/10 cursor-pointer transition-colors"
                  >
                    Logout
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 🔥 MAIN CTA BUTTON */}
          {!user && (
            <button onClick={handleBrowseMentors} className={ctaBase}>
              Browse mentors
            </button>
          )}

          {user && user.role === "student" && (
            <button onClick={handleBrowseMentors} className={ctaBase}>
              Browse mentors
            </button>
          )}

          {user && user.role === "mentor" && (
            <button onClick={handleDashboard} className={ctaBase}>
              Mentor Dashboard
            </button>
          )}
        </div>

        {/* MOBILE: avatar (if logged in) + hamburger toggle */}
        <div className="flex md:hidden items-center gap-3">
          {user && (
            <img
              src={user.profilePic || "/default-avatar.png"}
              alt="profile"
              className="w-9 h-9 rounded-full object-cover border border-white/20"
            />
          )}
          <button
            onClick={() => setMobileMenuOpen((p) => !p)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className="p-2 rounded-lg text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0b1f1a] px-4 sm:px-6 py-4 space-y-1 max-h-[calc(100dvh-64px)] overflow-y-auto">
          <nav className="flex flex-col gap-1 text-gray-300 text-base pb-2 mb-2 border-b border-white/10">
            <span className="px-3 py-2.5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">Engineering</span>
            <span className="px-3 py-2.5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">Design</span>
            <span className="px-3 py-2.5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">AI</span>
            <span className="px-3 py-2.5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">Startup</span>
          </nav>

          {!user && (
            <div className="flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-gray-300 hover:bg-white/10 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg border border-white/30 text-center text-white hover:border-white transition-colors"
              >
                Sign up
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleBrowseMentors();
                }}
                className={`${ctaBase} w-full mt-1`}
              >
                Browse mentors
              </button>
            </div>
          )}

          {user && (
            <div className="flex flex-col gap-1">
              <div className="px-3 py-2 text-sm text-gray-400">
                Hi, <span className="text-white font-medium">{user.firstName}</span>
              </div>

              {user.role === "mentor" && (
                <Link
                  to="/requests"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-gray-300 hover:bg-white/10 transition-colors"
                >
                  Requests
                </Link>
              )}

              <Link
                to="/connections"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-gray-300 hover:bg-white/10 transition-colors"
              >
                Connections
              </Link>

              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-gray-300 hover:bg-white/10 transition-colors"
              >
                Profile
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (user.role === "mentor") handleDashboard();
                  else handleBrowseMentors();
                }}
                className={`${ctaBase} w-full mt-2`}
              >
                {user.role === "mentor" ? "Mentor Dashboard" : "Browse mentors"}
              </button>

              <span
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="px-3 py-2.5 rounded-lg text-red-400 hover:bg-white/10 cursor-pointer transition-colors"
              >
                Logout
              </span>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
