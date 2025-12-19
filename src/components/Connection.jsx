import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constant";
import { addConnections } from "../utils/connectionSlice";

const Connection = () => {
  const dispatch = useDispatch();
  const connections = useSelector((store) => store.connection || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchConnections = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/connection`, {
        withCredentials: true,
      });

      dispatch(addConnections(res.data.connections || []));
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
    <div className="min-h-screen bg-linear-to-b from-[#eefaf5] to-white pt-32 px-6">
      <h1 className="text-4xl font-bold mb-14 text-center text-[#0b1f1a]">
        Your Connections
      </h1>

      {connections.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">
          No connections yet
        </p>
      ) : (
        <div className="flex justify-center">
          <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-2 ml-100">

            {connections.map((user) => (
              <div
                key={user._id}
                className="w-95 bg-white rounded-3xl shadow-lg hover:shadow-xl transition p-6"
              >
                {/* Profile section */}
                <div className="flex items-center gap-4">
                  <img
                    src={user.profilePic || "/default-avatar.png"}
                    alt="profile"
                    className="w-16 h-16 rounded-full object-cover border"
                  />

                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {user.firstName} {user.lastName}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {user.department || "Mentor"}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="my-5 h-px bg-gray-200" />

                {/* Chat button */}
                <button
                  className="w-full py-3 rounded-full bg-emerald-500 text-black font-semibold hover:bg-emerald-600 transition"
                >
                  💬 Chat
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Connection;
