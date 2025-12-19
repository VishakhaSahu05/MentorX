import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { addRequests } from "../utils/requestSlice";

const Requests = () => {
  const dispatch = useDispatch();
  const requests = useSelector((store) => store.requests || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/user/requests/received`,
        { withCredentials: true }
      );

      console.log("REQUESTS API RESPONSE:", res.data);
      dispatch(addRequests(res.data.requests || []));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);
  const handleAccept = async (fromUserId) => {
    try {
      await axios.post(
        BASE_URL+"/request/review/accepted/"+fromUserId,
        {},
        { withCredentials: true }
      );
      fetchRequests();
    } catch (err) {
      console.error("Accept failed:", err.response?.data || err.message);
    }
  };

  const handleReject = async (fromUserId) => {
    try {
      await axios.post(
        BASE_URL+"/request/review/rejected/"+fromUserId,
        {},
        { withCredentials: true }
      );
      fetchRequests();
    } catch (err) {
      console.error("Reject failed:", err.response?.data || err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <p className="text-gray-500 text-lg">Loading requests...</p>
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
        Connection Requests
      </h1>

      {requests.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">
          No pending requests
        </p>
      ) : (
        <div className="flex justify-center">
          <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-2 place-items-center">
            {requests.map((req) => (
              <div
                key={req._id}
                className="w-95 bg-white rounded-3xl shadow-lg hover:shadow-xl transition p-6"
              >
                {/* PROFILE */}
                <div className="flex items-center gap-4">
                  <img
                    src={
                      req.fromUserId?.profilePic || "/default-avatar.png"
                    }
                    alt="profile"
                    className="w-16 h-16 rounded-full object-cover border"
                  />

                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {req.fromUserId?.firstName}{" "}
                      {req.fromUserId?.lastName}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {req.fromUserId?.department || "User"}
                    </p>
                  </div>
                </div>

                {/* DIVIDER */}
                <div className="my-5 h-px bg-gray-200" />

                {/* ACTION BUTTONS */}
                <div className="flex gap-4">
                  <button
                    onClick={() =>
                      handleAccept(req.fromUserId._id)
                    }
                    className="flex-1 py-3 rounded-full bg-emerald-500 text-black font-semibold hover:bg-emerald-600 transition"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() =>
                      handleReject(req.fromUserId._id)
                    }
                    className="flex-1 py-3 rounded-full bg-red-100 text-red-600 font-semibold hover:bg-red-200 transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;
