import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constant";
import { addConnections } from "../utils/connectionSlice";

const LeftSidebar = () => {
  const user = useSelector((store) => store.user);
  const connections = useSelector((store) => store.connection?.connections);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/user/connection`, {
          withCredentials: true,
        });
        dispatch(addConnections(res.data.connections || res.data || []));
      } catch (err) {
        console.error("Failed to load connections", err);
      }
    };

    fetchConnections();
  }, [dispatch]);

  if (!user || user.role !== "student") return null;

  return (
    <div className="sticky top-24">
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        {/* PROFILE */}
        <div className="flex flex-col items-center text-center">
          <img
            src={user.profilePic || "/default-avatar.png"}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-400"
          />

          <h2 className="mt-3 font-semibold text-[#0b1f1a] truncate max-w-full">
            {user.firstName} {user.lastName}
          </h2>

          <p className="text-xs text-emerald-700 font-medium capitalize mt-0.5">
            Student
          </p>

          {user.department && (
            <p className="text-xs text-gray-500 mt-1">{user.department}</p>
          )}
        </div>

        {/* DIVIDER */}
        <div className="my-4 border-t border-gray-100" />

        {/* STATS */}
        <div className="flex justify-between text-sm text-gray-600">
          <span>Connections</span>
          <span className="font-semibold text-[#0b1f1a]">{connections?.length || 0}</span>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate("/profile")}
          className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-full text-sm font-medium transition-colors"
        >
          View Profile
        </button>

        <button
          onClick={() => navigate("/connections")}
          className="mt-2 w-full border border-gray-200 text-gray-700 hover:bg-gray-50 py-2 rounded-full text-sm font-medium transition-colors"
        >
          View Connections
        </button>
      </div>
    </div>
  );
};

export default LeftSidebar;
