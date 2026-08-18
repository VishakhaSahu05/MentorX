import { useNavigate } from "react-router-dom";
import { mentorsByDepartment } from "../data/mentors";

/**
 * Explore Topics — reuses the same department categories already shown
 * on the Mentors page (src/data/mentors.js). No new data introduced.
 */
const ExploreTopics = () => {
  const navigate = useNavigate();
  const topics = Object.keys(mentorsByDepartment);

  if (topics.length === 0) return null;

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <h3 className="font-semibold text-[#0b1f1a] text-sm mb-3.5">Explore Topics</h3>

      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <button
            key={topic}
            onClick={() => navigate("/")}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExploreTopics;
