import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowRight,
  CalendarDays,
  Disc,
  Mic,
  PenTool,
  Sparkles,
  UserRound,
  Users,
  Video,
} from "lucide-react";
import SessionPreview from "./landing/SessionPreview";
import FeaturedMentors from "./landing/FeaturedMentors";

const FEATURES = [
  {
    icon: Video,
    title: "1-on-1 video calls",
    text: "Call your mentor straight from the chat, and share your screen when words aren't enough.",
  },
  {
    icon: PenTool,
    title: "Shared whiteboard",
    text: "Sketch a system design or work through a problem together on the same live canvas.",
  },
  {
    icon: Disc,
    title: "Recorded sessions",
    text: "Record a session when both of you agree, and get the video in your inbox to rewatch later.",
  },
  {
    icon: Sparkles,
    title: "AI chat summaries",
    text: "Turn a long conversation into the key takeaways and next steps in one click.",
  },
  {
    icon: Mic,
    title: "Voice notes",
    text: "Ask a quick question out loud instead of typing a paragraph.",
  },
  {
    icon: CalendarDays,
    title: "Mentor calendar",
    text: "Mentors share when they're free, so you know the right time to reach out.",
  },
];

const STEPS = [
  {
    icon: UserRound,
    title: "Create your profile",
    text: "Tell us your department, skills and what you want to get better at.",
  },
  {
    icon: Users,
    title: "Connect with a mentor",
    text: "Find someone whose experience fits and send a request. Once they accept, you can chat.",
  },
  {
    icon: Video,
    title: "Learn live",
    text: "Jump on a call, draw it out on the whiteboard, and keep the recording and summary.",
  },
];

const primaryBtn =
  "inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold shadow-lg shadow-emerald-500/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2";
const secondaryBtn =
  "inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-[#0b1f1a]/15 bg-white/70 hover:bg-white text-[#0b1f1a] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2";

const Landing = () => {
  const user = useSelector((store) => store.user);
  const { hash } = useLocation();

  // Navbar links point at /#features etc.; scroll there once the page renders.
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, [hash]);

  const homeLink =
    user?.role === "mentor" ? "/mentor/dashboard" : user ? "/feed" : null;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden pt-28 sm:pt-32 lg:pt-36 pb-20 sm:pb-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-emerald-300/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 -left-40 w-[24rem] h-[24rem] rounded-full bg-teal-200/40 blur-3xl"
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-14 lg:gap-10 items-center">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 ring-1 ring-emerald-200 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-emerald-700">
              <Sparkles size={14} />
              Mentorship, live and 1-on-1
            </span>

            <h1 className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl text-[#0b1f1a] leading-[1.08] tracking-tight">
              Learn from people who have{" "}
              <span className="italic text-emerald-600">done it</span> before.
            </h1>

            <p className="mt-6 text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0">
              MentorX connects students with mentors for real conversations:
              video calls, a shared whiteboard, recorded sessions and AI
              summaries, all in one place.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              {homeLink ? (
                <Link to={homeLink} className={primaryBtn}>
                  {user.role === "mentor" ? "Open your dashboard" : "Go to your feed"}
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link to="/signup" className={primaryBtn}>
                    Find a mentor <ArrowRight size={18} />
                  </Link>
                  <Link to="/signup?role=mentor" className={secondaryBtn}>
                    Become a mentor
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="pb-20">
            <SessionPreview />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="scroll-mt-24 bg-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
              Everything in one place
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl text-[#0b1f1a]">
              Built for actually learning, not just messaging
            </h2>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {FEATURES.map(({ icon, title, text }) => (
              <div
                key={title}
                className="rounded-2xl border border-gray-100 bg-[#f7fcfa] p-6 hover:border-emerald-200 hover:shadow-md transition-all"
              >
                <span className="w-11 h-11 rounded-xl bg-[#0f2f26] text-emerald-400 flex items-center justify-center">
                  {React.createElement(icon, { size: 20 })}
                </span>
                <h3 className="mt-5 font-semibold text-lg text-[#0b1f1a]">{title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="scroll-mt-24 py-16 sm:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
              How it works
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl text-[#0b1f1a]">
              From sign-up to your first session
            </h2>
          </div>

          <ol className="mt-12 grid md:grid-cols-3 gap-10 md:gap-8">
            {STEPS.map(({ icon, title, text }, i) => (
              <li key={title} className="relative text-center md:text-left">
                {i < STEPS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="hidden md:block absolute top-6 left-16 right-0 border-t-2 border-dashed border-emerald-200"
                  />
                )}
                <span className="relative inline-flex w-12 h-12 rounded-full bg-emerald-500 text-black items-center justify-center shadow-lg shadow-emerald-500/25">
                  {React.createElement(icon, { size: 20 })}
                </span>
                <p className="mt-5 text-xs font-semibold text-emerald-600">STEP {i + 1}</p>
                <h3 className="mt-1 font-semibold text-lg text-[#0b1f1a]">{title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed max-w-xs mx-auto md:mx-0">
                  {text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="bg-white">
        <FeaturedMentors />
      </div>

      {/* CLOSING CTA */}
      {!user && (
        <section className="px-4 sm:px-6 pt-16 sm:pt-20">
          <div className="relative overflow-hidden max-w-5xl mx-auto rounded-3xl bg-[#0f2f26] px-6 py-12 sm:px-12 sm:py-16 text-center">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/20 blur-3xl"
            />
            <h2 className="relative font-display text-3xl sm:text-4xl text-white">
              Your next step is one conversation away
            </h2>
            <p className="relative mt-4 text-gray-300 max-w-xl mx-auto">
              Create an account and connect with a mentor today.
            </p>
            <div className="relative mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/signup" className={primaryBtn}>
                Get started <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-full border border-white/25 text-white font-semibold hover:border-white/60 transition-colors"
              >
                I already have an account
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Landing;
