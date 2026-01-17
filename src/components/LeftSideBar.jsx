import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const LeftSidebar = () => {
  const user = useSelector((store) => store.user);
  const navigate = useNavigate();

  if (!user || user.role !== "student") return null;

  return (
    <div className="sticky top-24">
      <div className="bg-white/70 backdrop-blur rounded-xl p-4 border border-emerald-100">
        {/* PROFILE */}
        <div className="flex flex-col items-center text-center">
          <img
            src={user.profilePic || "/default-avatar.png"}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-400"
          />

          <h2 className="mt-2 font-semibold text-[#0b1f1a]">
            {user.firstName} {user.lastName}
          </h2>

          <p className="text-xs text-gray-500 capitalize">
            Student
          </p>
        </div>

        {/* DIVIDER */}
        <div className="my-4 border-t border-emerald-100" />

        {/* CONNECTIONS ONLY */}
        <div className="flex justify-between text-sm text-gray-600">
          <span>Connections</span>
          <span className="font-semibold text-[#0b1f1a]">—</span>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate("/profile")}
          className="mt-4 w-full bg-emerald-600 text-white py-2 rounded-full text-sm hover:bg-emerald-700 transition"
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

export default LeftSidebar;
