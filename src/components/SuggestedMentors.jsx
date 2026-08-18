import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";

/**
 * Suggested Mentors — derived entirely from mentors already present in the
 * fetched feed (post.mentor), minus mentors the student is already
 * connected to. No fake/mock data: if the feed hasn't surfaced any new
 * mentors yet, this section simply doesn't render.
 */
const SuggestedMentors = () => {
  const feed = useSelector((store) => store.feed);
  const connections = useSelector((store) => store.connection?.connections || []);
  const navigate = useNavigate();

  const suggestions = useMemo(() => {
    const connectedIds = new Set(connections.map((c) => c._id));
    const seen = new Set();
    const unique = [];

    for (const post of feed) {
      const mentor = post.mentor;
      if (!mentor?._id) continue;
      if (connectedIds.has(mentor._id) || seen.has(mentor._id)) continue;
      seen.add(mentor._id);
      unique.push(mentor);
      if (unique.length === 4) break;
    }

    return unique;
  }, [feed, connections]);

  if (suggestions.length === 0) return null;

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <h3 className="font-semibold text-[#0b1f1a] text-sm mb-4">Suggested Mentors</h3>

      <div className="space-y-3.5">
        {suggestions.map((mentor) => (
          <div key={mentor._id} className="flex items-center gap-3 min-w-0">
            <img
              src={mentor.profilePic || "/default-avatar.png"}
              alt=""
              className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-gray-100 cursor-pointer"
              onClick={() => navigate(`/mentor/${mentor._id}`)}
            />
            <div
              className="min-w-0 flex-1 cursor-pointer"
              onClick={() => navigate(`/mentor/${mentor._id}`)}
            >
              <p className="text-sm font-medium text-gray-800 truncate hover:text-emerald-600 transition-colors">
                {mentor.firstName} {mentor.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">Mentor</p>
            </div>
            <button
              onClick={() => navigate(`/mentor/${mentor._id}`)}
              className="shrink-0 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              View
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/")}
        className="mt-4 w-full flex items-center justify-center gap-1.5 text-xs font-medium text-gray-500 hover:text-emerald-600 pt-3 border-t border-gray-100 transition-colors"
      >
        <Users size={13} />
        Browse all mentors
      </button>
    </div>
  );
};

export default SuggestedMentors;
