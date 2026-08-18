import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Users, MessageCircle } from "lucide-react";
import { BASE_URL } from "../utils/constant";
import { addConnections } from "../utils/connectionSlice";
import { Link } from "react-router-dom";

const Connection = () => {
  const dispatch = useDispatch();

  const connections = useSelector(
    (store) => store.connection?.connections || []
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchConnections = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/connection`, {
        withCredentials: true,
      });

      dispatch(addConnections(res.data.connections || res.data || []));
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-28 px-4">
        <p className="text-gray-500 text-lg">Loading connections...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-28 px-4">
        <p className="text-red-500 text-lg text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pt-24 sm:pt-28 px-4 sm:px-6 pb-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Your Connections
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              People you're connected with on MentorX
            </p>
          </div>
          {connections.length > 0 && (
            <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold">
              <Users size={14} />
              {connections.length}
            </span>
          )}
        </div>

      {connections.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <span className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
            <Users size={20} className="text-gray-400" />
          </span>
          <p className="text-sm font-medium text-gray-700">You don't have any connections yet</p>
          <p className="text-xs text-gray-500 mt-1">Connect with mentors to see them here.</p>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="flex flex-col gap-3 w-full">

            {connections.map((user) => (
              <div
                key={user._id}
                className="group bg-white rounded-2xl border border-gray-100
                           shadow-sm hover:shadow-md transition-all duration-300
                           p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4"
              >
                {/* LEFT */}
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={user.profilePic || "/default-avatar.png"}
                    alt="profile"
                    className="w-12 h-12 rounded-full object-cover border border-gray-100 shrink-0"
                  />

                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-gray-800
                                   group-hover:text-emerald-600 transition-colors truncate">
                      {user.firstName} {user.lastName}
                    </h2>
                    <span className="inline-block mt-0.5 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium truncate max-w-full">
                      {user.department || "Mentor"}
                    </span>
                  </div>
                </div>

                {/* RIGHT */}
                <Link to={`/chat/${user._id}`} className="shrink-0">
                  <button
                    className="inline-flex items-center gap-2 px-5 sm:px-6 py-2 rounded-full bg-emerald-500 text-black
                               text-sm font-semibold hover:bg-emerald-600 active:bg-emerald-700 transition-colors
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  >
                    <MessageCircle size={16} strokeWidth={2.25} />
                    Chat
                  </button>
                </Link>
              </div>
            ))}

          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Connection;
