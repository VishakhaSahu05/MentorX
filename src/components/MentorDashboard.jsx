import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constant";
import { useNavigate } from "react-router-dom";
import MentorCalendar from "../components/MentorCalendar";

export default function MentorDashboard() {
  const { id } = useParams();
  const feedRef = useRef(null);
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const [showUpload, setShowUpload] = useState(false);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [connectionStatus, setConnectionStatus] = useState("none");

  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const url = id ? BASE_URL + "/mentor/" + id : BASE_URL + "/mentor";

        const res = await axios.get(url, {
          withCredentials: true,
        });

        setDashboard(res.data);
        setPosts(res.data.posts || []);

        if (!id) {
          setConnectionStatus("none");
          return;
        }

        const statusRes = await axios.get(BASE_URL + "/request/status/" + id, {
          withCredentials: true,
        });

        setConnectionStatus(statusRes.data.status || "none");
      } catch (err) {
        if (err.response?.status === 401) {
          setConnectionStatus("none");
        } else {
          console.log(err);
        }
      }
    };

    fetchDashboard();
  }, [id]);

  /* ================= SCROLL ================= */
  useEffect(() => {
    if (activeIndex !== null && feedRef.current) {
      feedRef.current.children[activeIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeIndex]);

  /* Connect */
  const handleConnect = async () => {
    try {
      await axios.post(
        BASE_URL + "/request/send/interested/" + id,
        {},
        {
          withCredentials: true,
        }
      );

      setConnectionStatus("interested");
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        console.error(err.response?.data || err.message);
      }
    }
  };

  /* Upload post */
  const handleUpload = async () => {
    if (!file) return alert("Select an image");

    try {
      setUploading(true);

      const fd = new FormData();
      fd.append("media", file);
      fd.append("caption", caption);

      const res = await axios.post(`${BASE_URL}/upload`, fd, {
        withCredentials: true,
      });

      //ADD POST LOCALLY (NO EXTRA API CALL)
      setPosts((prev) => [res.data, ...prev]);

      setShowUpload(false);
      setCaption("");
      setFile(null);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  /* delete post */
  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`${BASE_URL}/post/${postId}`, {
        withCredentials: true,
      });

      setPosts((prev) => prev.filter((p) => p._id !== postId));
      setOpenMenuId(null);
      setActiveIndex(null);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  if (!dashboard) return null;

  const { profile, stats, view } = dashboard;
  const isOwner = view === "OWNER";

  return (
    <div className="pt-20 bg-[#f3f2ef] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* profile */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="h-32 bg-linear-to-r from-emerald-700 to-teal-600" />
          <div className="p-6 relative">
            <img
              src={profile.profilePic}
              className="w-28 h-28 rounded-full border-4 border-white absolute -top-14"
            />
            <div className="mt-16">
              <h1 className="text-2xl font-bold">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-gray-600">Mentor</p>

              <div className="flex gap-6 mt-2 text-sm text-gray-600">
                <span>{stats.followersCount} Followers</span>
                <span>⭐ {stats.rating}</span>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {profile.skills?.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 text-xs rounded-full bg-black/5"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {!isOwner && (
                <button
                  onClick={handleConnect}
                  disabled={connectionStatus !== "none"}
                  className={`mt-4 px-6 py-2 rounded-full font-semibold
      ${
        connectionStatus === "none"
          ? "bg-emerald-600 text-white"
          : "bg-gray-300 text-gray-700"
      }`}
                >
                  {connectionStatus === "none" && "CONNECT"}
                  {connectionStatus === "interested" && "REQUEST SENT"}
                  {connectionStatus === "accepted" && "CONNECTED"}
                  {connectionStatus === "rejected" && "REJECTED"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Owner Actions*/}
        {isOwner && !id && (
          <>
            <div
              onClick={() => setShowUpload(true)}
              className="bg-white rounded-xl shadow p-4 flex gap-3 cursor-pointer"
            >
              <img
                src={profile.profilePic}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-gray-500">
                ✨ Share something with your students
              </div>
            </div>

            {/*  CALENDAR */}
            <div
              onClick={() => setShowCalendar((prev) => !prev)}
              className="bg-white rounded-xl shadow p-4 flex gap-3 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                📅
              </div>
              <div>
                <p className="font-semibold">My Calendar</p>
                <p className="text-sm text-gray-500">Manage your schedule</p>
              </div>
            </div>
          </>
        )}
        {isOwner && !id && showCalendar && <MentorCalendar />}

        {/* Post Grid */}
        <div>
          <h2 className="font-semibold mb-3">Posts</h2>
          <div className="grid grid-cols-3 gap-[2px]">
            {posts.map((post, i) => (
              <div
                key={post._id}
                onClick={() => setActiveIndex(i)}
                className="aspect-square bg-black cursor-pointer"
              >
                <img
                  src={post.mediaUrl}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FULLSCREEN POSTS */}
      {activeIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95">
          <button
            onClick={() => setActiveIndex(null)}
            className="absolute top-4 right-4 text-white text-2xl"
          >
            ✕
          </button>

          <div
            ref={feedRef}
            className="h-full overflow-y-scroll snap-y snap-mandatory"
          >
            {posts.map((post) => (
              <div
                key={post._id}
                className="snap-start flex justify-center py-10"
              >
                <div className="w-full max-w-md text-white">
                  <div className="flex items-center px-3 py-2 relative">
                    <img
                      src={profile.profilePic}
                      className="w-8 h-8 rounded-full mr-3"
                    />
                    <span className="font-semibold flex-1">
                      {profile.firstName}
                    </span>

                    {isOwner && !id && (
                      <>
                        <button
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === post._id ? null : post._id
                            )
                          }
                          className="text-xl"
                        >
                          ⋮
                        </button>

                        {openMenuId === post._id && (
                          <div className="absolute right-2 top-10 bg-white text-black rounded shadow w-28">
                            <button className="block w-full px-3 py-2 hover:bg-gray-100">
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePost(post._id)}
                              className="block w-full px-3 py-2 text-red-600 hover:bg-gray-100"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <img
                    src={post.mediaUrl}
                    className="w-full max-h-[65vh] object-contain"
                  />

                  {post.caption && (
                    <div className="px-3 py-3 text-sm">
                      <span className="font-semibold mr-1">
                        {profile.firstName}
                      </span>
                      {post.caption}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= UPLOAD MODAL ================= */}
      {showUpload && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-xl p-6 relative">
            <button
              onClick={() => setShowUpload(false)}
              className="absolute top-3 right-3 text-xl"
            >
              ✕
            </button>

            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write something..."
              className="w-full border rounded-lg p-3 mb-4"
            />

            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="mb-4"
            />

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full py-2 bg-emerald-600 text-white rounded-lg"
            >
              {uploading ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
