import React, { useEffect, useState } from "react";
import axios from "axios";
import { Inbox } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center pt-28 px-4">
        <p className="text-gray-500 text-lg">Loading requests...</p>
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
    <div className="min-h-screen bg-linear-to-b from-[#eefaf5] to-white pt-24 sm:pt-28 lg:pt-32 px-4 sm:px-6 pb-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8 sm:mb-10">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0b1f1a]">
              Connection Requests
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Students who want to connect with you
            </p>
          </div>
          {requests.length > 0 && (
            <span className="self-center sm:self-auto shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold">
              <Inbox size={14} />
              {requests.length} pending
            </span>
          )}
        </div>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-white rounded-2xl border border-gray-100 shadow-sm max-w-md mx-auto">
          <span className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
            <Inbox size={20} className="text-gray-400" />
          </span>
          <p className="text-sm font-medium text-gray-700">No pending requests</p>
          <p className="text-xs text-gray-500 mt-1">New connection requests will show up here.</p>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 place-items-stretch">
            {requests.map((req) => (
              <div
                key={req._id}
                className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5"
              >
                {/* PROFILE */}
                <div className="flex items-center gap-3.5">
                  <img
                    src={
                      req.fromUserId?.profilePic || "/default-avatar.png"
                    }
                    alt="profile"
                    className="w-14 h-14 rounded-full object-cover border border-gray-100 shrink-0"
                  />

                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-gray-800 truncate">
                      {req.fromUserId?.firstName}{" "}
                      {req.fromUserId?.lastName}
                    </h2>
                    <span className="inline-block mt-0.5 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium truncate max-w-full">
                      {req.fromUserId?.department || "User"}
                    </span>
                  </div>
                </div>

                {/* DIVIDER */}
                <div className="my-4 h-px bg-gray-100" />

                {/* ACTION BUTTONS */}
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      handleAccept(req.fromUserId._id)
                    }
                    className="flex-1 py-2.5 rounded-full bg-emerald-500 text-black text-sm font-semibold hover:bg-emerald-600 transition-colors"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() =>
                      handleReject(req.fromUserId._id)
                    }
                    className="flex-1 py-2.5 rounded-full bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors"
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
    </div>
  );
};

export default Requests;
