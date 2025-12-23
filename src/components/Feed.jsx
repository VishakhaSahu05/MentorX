import axios from "axios";
import React, { useEffect, useState } from "react";
import { BASE_URL } from "../utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { addFeed } from "../utils/feedSlice";
 import { removeUserFromFeed } from "../utils/feedSlice";

const Feed = () => {
  const feed = useSelector((store) => store.feed); // null | array
  const dispatch = useDispatch();
  const [sendingId, setSendingId] = useState(null);

  // Fetch mentors feed
  const getFeed = async () => {
    if (feed !== null) return;

    try {
      const res = await axios.get(
        BASE_URL + "/feed",
        { withCredentials: true }
      );
      dispatch(addFeed(res.data.mentors || []));
    } catch (err) {
      console.error("Failed to load feed", err);
    }
  };

  useEffect(() => {
    getFeed();
  }, []);

// SEND CONNECTION REQUEST (STUDENT → MENTOR)
const handleSendRequest = async (mentorId) => {
  try {
    setSendingId(mentorId);

    await axios.post(
      `${BASE_URL}/request/send/interested/${mentorId}`,
      {},
      { withCredentials: true }
    );

    // UI se mentor hata do
    dispatch(removeUserFromFeed(mentorId));

  } catch (err) {
    console.error(
      "Send request failed:",
      err.response?.data || err.message
    );
    alert(err.response?.data?.message || "Failed to send request!");
  } finally {
    setSendingId(null);
  }
};

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-semibold mb-8 text-[#0b1f1a]">
        Your Feed
      </h1>

      {/* Loading */}
      {feed === null && (
        <p className="text-gray-500">Loading mentors...</p>
      )}

      {/* Empty */}
      {Array.isArray(feed) && feed.length === 0 && (
        <p className="text-gray-500">
          No mentors available right now
        </p>
      )}

      {/* Mentor Cards */}
      {Array.isArray(feed) &&
        feed.map((mentor) => (
          <div
            key={mentor._id}
            className="mb-10 bg-white rounded-2xl shadow-lg p-8"
          >
            {/* Top */}
            <div className="flex items-center gap-6">
              <img
                src={mentor.profilePic || "/default-avatar.png"}
                alt="mentor"
                className="w-24 h-24 rounded-full object-cover border-2 border-emerald-500"
              />

              <div>
                <h2 className="text-2xl font-semibold text-[#0b1f1a]">
                  {mentor.firstName} {mentor.lastName}
                </h2>

                <span className="inline-block mt-2 px-3 py-1 text-sm rounded-full bg-emerald-100 text-emerald-700">
                  {mentor.department}
                </span>

                <p className="text-sm text-gray-500 mt-2">
                  {mentor.emailId}
                </p>
              </div>
            </div>

            {/* Skills */}
            <div className="mt-6">
              <h3 className="font-medium text-gray-800 mb-2">
                Skills
              </h3>

              <div className="flex flex-wrap gap-2">
                {mentor.skills?.length > 0 ? (
                  mentor.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">
                    No skills listed
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-4">
              <button className="flex-1 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold">
                View Profile
              </button>

              <button
                onClick={() => handleSendRequest(mentor._id)}
                disabled={sendingId === mentor._id}
                className="flex-1 py-3 rounded-full border border-emerald-500 text-emerald-600 font-semibold hover:bg-emerald-50 disabled:opacity-50"
              >
                {sendingId === mentor._id
                  ? "Sending..."
                  : "Connect"}
              </button>
            </div>
          </div>
        ))}
    </div>
  );
};

export default Feed;
