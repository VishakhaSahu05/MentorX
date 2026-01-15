import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constant";
import MentorCalendar from "../components/MentorCalendar";

export default function MentorDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);

  const [showUpload, setShowUpload] = useState(false);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [connectionStatus, setConnectionStatus] = useState("none");
  const [showCalendar, setShowCalendar] = useState(false);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editCaption, setEditCaption] = useState("");

  /* FETCH DASHBOARD */
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const url = id ? `${BASE_URL}/mentor/${id}` : `${BASE_URL}/mentor`;
        const res = await axios.get(url, { withCredentials: true });

        setDashboard(res.data);
        setPosts(res.data.posts || []);

        if (!id) return;

        const statusRes = await axios.get(`${BASE_URL}/request/status/${id}`, {
          withCredentials: true,
        });

        setConnectionStatus(statusRes.data.status || "none");
      } catch (err) {
        console.error(err);
      }
    };

    fetchDashboard();
  }, [id]);

  useEffect(() => {
    console.log("POSTS:", posts);
    posts.forEach((p) => {
      console.log("MEDIA URL:", p.mediaUrl, "TYPE:", p.mediaType);
    });
  }, [posts]);

  /* CONNECT */
  const handleConnect = async () => {
    try {
      await axios.post(
        `${BASE_URL}/request/send/interested/${id}`,
        {},
        { withCredentials: true }
      );
      setConnectionStatus("interested");
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
    }
  };

  /* UPLOAD */
  const handleUpload = async () => {
    if (!file) return alert("Select image or video");

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("media", file);
      fd.append("caption", caption);

      const res = await axios.post(`${BASE_URL}/upload`, fd, {
        withCredentials: true,
      });

      setPosts((prev) => [res.data, ...prev]);
      setShowUpload(false);
      setCaption("");
      setFile(null);
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* DELETE */
  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`${BASE_URL}/post/${postId}`, {
        withCredentials: true,
      });

      setPosts((prev) => prev.filter((p) => p._id !== postId));
      setActiveIndex(null);
    } catch {
      alert("Delete failed");
    }
  };

  /* SAVE EDIT */
  const handleSaveEdit = async () => {
    try {
      await axios.put(
        `${BASE_URL}/post/${editingPost._id}`,
        { caption: editCaption },
        { withCredentials: true }
      );

      setPosts((prev) =>
        prev.map((p) =>
          p._id === editingPost._id ? { ...p, caption: editCaption } : p
        )
      );

      setEditingPost(null);
    } catch {
      alert("Edit failed");
    }
  };

  if (!dashboard) return null;

  const { profile, stats, view } = dashboard;
  const isOwner = view === "OWNER";

  return (
    <div className="pt-20 bg-[#f3f2ef] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* PROFILE */}
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

              {!isOwner && (
                <button
                  onClick={handleConnect}
                  disabled={connectionStatus !== "none"}
                  className="mt-4 px-6 py-2 rounded-full bg-emerald-600 text-white"
                >
                  CONNECT
                </button>
              )}
            </div>
          </div>
        </div>

        {/* OWNER ACTIONS */}
        {isOwner && !id && (
          <>
            <div
              onClick={() => setShowUpload(true)}
              className="bg-white rounded-xl shadow p-4 cursor-pointer"
            >
              ✨ Share something
            </div>

            <div
              onClick={() => setShowCalendar((p) => !p)}
              className="bg-white rounded-xl shadow p-4 cursor-pointer"
            >
              📅 My Calendar
            </div>
          </>
        )}

        {showCalendar && <MentorCalendar />}

        {/* GRID */}
        <div className="grid grid-cols-3 gap-[2px]">
          {posts.map((post, i) => {
            const isVideo =
              post.mediaUrl?.includes("/videos/") ||
              post.mediaUrl?.endsWith(".mp4");

            return (
              <div
                key={post._id}
                onClick={() => setActiveIndex(i)}
                className="aspect-square bg-black cursor-pointer"
              >
                {isVideo ? (
                  <video
                    src={encodeURI(post.mediaUrl)}
                    muted
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={post.mediaUrl}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* FIXED SCROLLABLE MODAL */}
        {activeIndex !== null && (
          <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto">
            <div className="max-w-2xl mx-auto py-10 space-y-10">
              {posts.map((post) => {
                const isVideo =
                  post.mediaUrl?.endsWith(".mp4") ||
                  post.mediaUrl?.includes("/videos/");

                return (
                  <div
                    key={post._id}
                    className="bg-white rounded-xl shadow overflow-hidden mx-4"
                  >
                    {/* HEADER */}
                    <div className="flex justify-between items-center p-4 border-b">
                      <div>
                        <p className="font-semibold">
                          {profile.firstName} {profile.lastName}
                        </p>
                        <p className="text-xs text-gray-500">Mentor</p>
                      </div>

                      {isOwner && (
                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId === post._id ? null : post._id
                              )
                            }
                          >
                            ⋮
                          </button>

                          {openMenuId === post._id && (
                            <div className="absolute right-0 mt-2 bg-white shadow rounded w-32 z-50">
                              <button
                                onClick={() => {
                                  setEditingPost(post);
                                  setEditCaption(post.caption || "");
                                  setOpenMenuId(null);
                                }}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeletePost(post._id)}
                                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* MEDIA */}
                    <div className="bg-black flex justify-center items-center">
                      {isVideo ? (
                        <video
                          src={encodeURI(post.mediaUrl)}
                          controls
                          preload="metadata"
                          playsInline
                          className="max-h-[520px] w-full object-contain bg-black"
                          onError={() =>
                            console.log("VIDEO FAILED:", post.mediaUrl)
                          }
                        />
                      ) : (
                        <img
                          src={post.mediaUrl}
                          className="max-h-[520px] w-full object-contain"
                        />
                      )}
                    </div>

                    {/* FOOTER */}
                    <div className="p-4 text-sm">
                      <span className="font-semibold mr-1">
                        {profile.firstName}
                      </span>
                      {post.caption}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CLOSE */}
            <button
              onClick={() => setActiveIndex(null)}
              className="fixed top-6 right-6 text-white text-3xl"
            >
              ✕
            </button>
          </div>
        )}

        {/* UPLOAD MODAL */}
        {showUpload && (
          <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-md relative">
              <button
                onClick={() => setShowUpload(false)}
                className="absolute top-3 right-3"
              >
                ✕
              </button>

              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full border p-3 rounded mb-3"
                placeholder="Write something..."
              />

              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setFile(e.target.files[0])}
              />

              <button
                onClick={handleUpload}
                disabled={uploading}
                className="mt-4 w-full bg-emerald-600 text-white py-2 rounded"
              >
                {uploading ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {editingPost && (
          <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-md relative">
              <button
                onClick={() => setEditingPost(null)}
                className="absolute top-3 right-3"
              >
                ✕
              </button>

              <textarea
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                className="w-full border p-3 rounded mb-3"
              />

              <button
                onClick={handleSaveEdit}
                className="w-full bg-emerald-600 text-white py-2 rounded"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
