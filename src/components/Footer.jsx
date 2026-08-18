import React from "react";

const Footer = () => {
  return (
    <footer className="mt-16 sm:mt-20 border-t border-white/10 bg-[#071612] text-gray-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10 sm:py-12 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
        <div className="col-span-2 md:col-span-1">
          <h2 className="text-2xl font-semibold text-white">
            Mentor<span className="text-emerald-400">X</span>
          </h2>
          <p className="mt-4 text-sm text-gray-400 max-w-xs">
            Connect with mentors. Learn faster.
            Grow your career with the right guidance.
          </p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-4">Explore</h3>
          <ul className="space-y-2.5 text-sm">
            <li className="hover:text-emerald-400 cursor-pointer transition-colors">Mentors</li>
            <li className="hover:text-emerald-400 cursor-pointer transition-colors">Domains</li>
            <li className="hover:text-emerald-400 cursor-pointer transition-colors">Community</li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-4">Company</h3>
          <ul className="space-y-2.5 text-sm">
            <li className="hover:text-emerald-400 cursor-pointer transition-colors">About</li>
            <li className="hover:text-emerald-400 cursor-pointer transition-colors">Careers</li>
            <li className="hover:text-emerald-400 cursor-pointer transition-colors">Contact</li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="text-white font-semibold mb-4">Follow us</h3>
          <ul className="space-y-2.5 text-sm">
            <li className="hover:text-emerald-400 cursor-pointer transition-colors">LinkedIn</li>
            <li className="hover:text-emerald-400 cursor-pointer transition-colors">Twitter</li>
            <li className="hover:text-emerald-400 cursor-pointer transition-colors">GitHub</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 px-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} MentorX. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
