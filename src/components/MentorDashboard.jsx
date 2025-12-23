import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constant";
import { addConnections } from "../utils/connectionSlice";

export default function MentorDashboard() {
  const dispatch = useDispatch();

  // Redux data
  const user = useSelector((store) => store.user);
  const connections = useSelector((store) => store.connection || []);

  const [openCalendar, setOpenCalendar] = useState(false);

  //Fetch accepted connections 
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const res = await axios.get(
          BASE_URL + "/user/connection",
          { withCredentials: true }
        );

        dispatch(addConnections(res.data.connections || []));
      } catch (err) {
        console.error("Error fetching connections", err);
      }
    };

    fetchConnections();
  }, [dispatch]);

  // Followers = accepted connections count
  const followersCount = connections.length;

  return (
    <div className="min-h-screen bg-[#eefaf5] flex justify-center pt-24 pb-10">
      <div className="bg-white w-[90%] rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-10">

        {/* ===== HEADER ===== */}
        <div className="flex items-center gap-4 mb-10">
          <img
            src={user?.profilePic || "/default-avatar.png"}
            alt="mentor"
            className="w-16 h-16 rounded-full ring-2 ring-[#0f2f26]/20 shadow"
          />
          <div>
            <h1 className="text-2xl font-bold text-[#0f2f26]">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-sm text-gray-500">Mentor Dashboard</p>
          </div>
        </div>

        {/* ===== STATS ===== */}
        <div className="grid grid-cols-2 gap-6 mb-10">

          {/* Followers */}
          <div className="bg-[#f4fbf8] border border-[#dfeee8] rounded-2xl p-6 shadow-sm">
            <p className="text-gray-600 text-sm">Followers</p>
            <p className="text-4xl font-extrabold text-[#0f2f26] mt-2">
              {followersCount}
            </p>
          </div>

          {/* Rating */}
          <div className="bg-[#f4fbf8] border border-[#dfeee8] rounded-2xl p-6 shadow-sm">
            <p className="text-gray-600 text-sm">Rating</p>
            <p className="text-4xl font-extrabold text-[#0f2f26] mt-2 flex items-center gap-2">
              4.6 <span className="text-yellow-400 text-3xl">★</span>
            </p>
          </div>

        </div>

        {/* ===== CALENDAR ===== */}
        <div className="bg-[#f4fbf8] border border-[#dfeee8] rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-[#0f2f26]">
              <span className="bg-[#e7f5ef] p-2 rounded-lg">📅</span>
              Calendar
            </h2>

            <button
              onClick={() => setOpenCalendar(true)}
              className="text-sm text-[#0f2f26]/70 hover:text-[#0f2f26]"
            >
              View full →
            </button>
          </div>

          {/* Mini calendar */}
          <div className="grid grid-cols-7 gap-3 text-center text-sm">
            {["S","M","T","W","T","F","S"].map((d) => (
              <div key={d} className="text-gray-600 font-medium">
                {d}
              </div>
            ))}

            {Array.from({ length: 14 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-[#e3f1ec] rounded-xl py-3 hover:bg-[#eefaf5]"
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== FULL CALENDAR MODAL ===== */}
      {openCalendar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] h-[90%] rounded-3xl p-8 relative overflow-auto">
            <button
              onClick={() => setOpenCalendar(false)}
              className="absolute top-4 right-4 text-2xl"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold mb-6 text-[#0f2f26]">
              📅 December 2025
            </h2>

            <div className="grid grid-cols-7 gap-4 text-center">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
                <div key={d} className="font-medium text-gray-600">
                  {d}
                </div>
              ))}

              {Array.from({ length: 31 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-[#e3f1ec] rounded-xl h-28 p-2 hover:bg-[#eefaf5]"
                >
                  <div className="font-semibold">{i + 1}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
