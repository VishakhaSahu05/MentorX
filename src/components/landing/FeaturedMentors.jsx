import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { ArrowRight, UserPlus } from "lucide-react";
import { BASE_URL } from "../../utils/constant";
import MentorAvatar from "./MentorAvatar";

// Labels for the department codes stored on the user model.
const DEPARTMENT_LABELS = {
  CSE: "Computer Science",
  IT: "Information Technology",
  ECE: "Electronics & Communication",
  EE: "Electrical",
  ME: "Mechanical",
  CIVIL: "Civil",
};

const CARD = "w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]";

const MentorCard = ({ mentor, to }) => (
  <Link
    to={to}
    className={`${CARD} group flex flex-col bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-emerald-200 transition-all`}
  >
    <div className="flex items-center gap-4">
      <MentorAvatar
        firstName={mentor.firstName}
        lastName={mentor.lastName}
        profilePic={mentor.profilePic}
        className="w-14 h-14 text-lg shrink-0"
      />
      <div className="min-w-0">
        <h3 className="font-semibold text-[#0b1f1a] truncate">
          {mentor.firstName} {mentor.lastName}
        </h3>
        <p className="text-sm text-gray-500 truncate">
          {DEPARTMENT_LABELS[mentor.department] || "Mentor"}
        </p>
      </div>
    </div>

    {mentor.about && (
      <p className="mt-4 text-sm text-gray-600 line-clamp-2">{mentor.about}</p>
    )}

    {mentor.skills?.length > 0 && (
      <div className="mt-4 flex flex-wrap gap-1.5">
        {mentor.skills.map((skill) => (
          <span
            key={skill}
            className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium"
          >
            {skill}
          </span>
        ))}
      </div>
    )}

    <span className="mt-auto pt-5 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 group-hover:gap-2 transition-all">
      View profile <ArrowRight size={16} />
    </span>
  </Link>
);

// A banner under the grid rather than a card in it, so it never ends up
// stranded alone on a row whatever the number of mentors.
const BecomeMentorBanner = ({ isFirst }) => (
  <Link
    to="/signup?role=mentor"
    className="group mt-6 mx-auto max-w-3xl flex flex-col sm:flex-row items-center gap-4 sm:gap-5 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/60 px-6 py-5 text-center sm:text-left hover:bg-emerald-50 hover:border-emerald-400 transition-colors"
  >
    <span className="w-12 h-12 shrink-0 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
      <UserPlus size={22} />
    </span>
    <div className="flex-1">
      <h3 className="font-semibold text-[#0b1f1a]">
        {isFirst ? "Be one of our first mentors" : "Your profile could be here"}
      </h3>
      <p className="mt-0.5 text-sm text-gray-600">
        Share what you know and guide students who are where you once were.
      </p>
    </div>
    <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 whitespace-nowrap group-hover:gap-2 transition-all">
      Become a mentor <ArrowRight size={16} />
    </span>
  </Link>
);

const SkeletonCard = () => (
  <div className={`${CARD} rounded-2xl bg-white border border-gray-100 p-5 animate-pulse`}>
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-full bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-2/3 rounded bg-gray-200" />
        <div className="h-3 w-1/2 rounded bg-gray-100" />
      </div>
    </div>
    <div className="mt-5 space-y-2">
      <div className="h-3 rounded bg-gray-100" />
      <div className="h-3 w-4/5 rounded bg-gray-100" />
    </div>
  </div>
);

/**
 * Real mentors from the backend. While the platform is small this shows
 * whoever has signed up, plus an invitation card to fill the space, rather
 * than invented profiles. Hidden entirely if the request fails.
 */
const FeaturedMentors = () => {
  const user = useSelector((store) => store.user);
  const [mentors, setMentors] = useState(null); // null = loading
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    axios
      .get(`${BASE_URL}/mentors/featured`)
      .then((res) => {
        if (!cancelled) setMentors(res.data?.mentors || []);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // The invitation card is for visitors; a logged-in user already has a role.
  const showInvite = !user && mentors !== null && mentors.length < 6;

  if (failed) return null;
  if (mentors?.length === 0 && !showInvite) return null;

  // Mentor profiles need an account; visitors are sent to log in first.
  const profileLink = (id) => (user ? `/mentor/${id}` : "/login");

  return (
    <section id="mentors" className="scroll-mt-24 py-16 sm:py-20 lg:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
            Featured mentors
          </p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl text-[#0b1f1a]">
            Meet the people guiding our students
          </h2>
        </div>

        {(mentors === null || mentors.length > 0) && (
          <div className="mt-10 sm:mt-12 flex flex-wrap justify-center gap-6">
            {mentors === null
              ? [0, 1, 2].map((i) => <SkeletonCard key={i} />)
              : mentors.map((m) => (
                  <MentorCard key={m._id} mentor={m} to={profileLink(m._id)} />
                ))}
          </div>
        )}

        {showInvite && <BecomeMentorBanner isFirst={mentors.length === 0} />}
      </div>
    </section>
  );
};

export default FeaturedMentors;
