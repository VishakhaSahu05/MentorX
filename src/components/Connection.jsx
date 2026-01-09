import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
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
      <div className="min-h-screen flex items-center justify-center pt-32">
        <p className="text-gray-500 text-lg">Loading connections...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pt-28 px-4">
      <h1 className="text-3xl font-bold mb-10 text-center text-gray-900">
        Your Connections
      </h1>

      {connections.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">
          You don’t have any connections yet
        </p>
      ) : (
        <div className="flex justify-center">
          <div className="flex flex-col gap-4 w-full max-w-3xl">

            {connections.map((user) => (
              <div
                key={user._id}
                className="group bg-white rounded-2xl border border-gray-100 
                           shadow-sm hover:shadow-md transition-all duration-300
                           p-5 flex items-center justify-between"
              >
                {/* LEFT */}
                <div className="flex items-center gap-4">
                  <img
                    src={user.profilePic || "/default-avatar.png"}
                    alt="profile"
                    className="w-12 h-12 rounded-full object-cover border"
                  />

                  <div>
                    <h2 className="text-base font-semibold text-gray-800 
                                   group-hover:text-emerald-600 transition">
                      {user.firstName} {user.lastName}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {user.department || "Mentor"}
                    </p>
                  </div>
                </div>

                {/* RIGHT */}
                <Link to={`/chat/${user._id}`}>
                  <button
                    className="px-6 py-2 rounded-full bg-emerald-500 text-black
                               text-sm font-semibold hover:bg-emerald-600 transition"
                  >
                    💬 Chat
                  </button>
                </Link>
              </div>
            ))}

          </div>
        </div>
      )}
    </div>
  );
};

export default Connection;
