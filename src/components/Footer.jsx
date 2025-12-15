import React from "react";

const Footer = () => {
  return (
    <footer className="mt-20 border-t border-white/10 bg-[#071612] text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <h2 className="text-2xl font-semibold text-white">
            Mentor<span className="text-emerald-400">X</span>
          </h2>
          <p className="mt-4 text-sm text-gray-400">
            Connect with mentors. Learn faster.  
            Grow your career with the right guidance.
          </p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-4">Explore</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-emerald-400 cursor-pointer">Mentors</li>
            <li className="hover:text-emerald-400 cursor-pointer">Domains</li>
            <li className="hover:text-emerald-400 cursor-pointer">Community</li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-4">Company</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-emerald-400 cursor-pointer">About</li>
            <li className="hover:text-emerald-400 cursor-pointer">Careers</li>
            <li className="hover:text-emerald-400 cursor-pointer">Contact</li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="text-white font-semibold mb-4">Follow us</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-emerald-400 cursor-pointer">LinkedIn</li>
            <li className="hover:text-emerald-400 cursor-pointer">Twitter</li>
            <li className="hover:text-emerald-400 cursor-pointer">GitHub</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} MentorX. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
