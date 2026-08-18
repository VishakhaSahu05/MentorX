import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Sparkles, CalendarDays, Users, Star, ImageOff, Check } from "lucide-react";
import { BASE_URL } from "../utils/constant";
import MentorCalendar from "../components/MentorCalendar";
import PostScrollViewer from "../components/PostScrollViewer";

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
        { withCredentials: true },
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
        { withCredentials: true },
      );

      setPosts((prev) =>
        prev.map((p) =>
          p._id === editingPost._id ? { ...p, caption: editCaption } : p,
        ),
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
    <div className="pt-24 sm:pt-28 bg-[#f3f2ef] min-h-screen pb-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-5 sm:space-y-6">
        {/* PROFILE */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="h-20 sm:h-24 bg-linear-to-r from-emerald-700 via-emerald-600 to-teal-600" />
          <div className="px-4 sm:px-6 pb-5 sm:pb-6 pt-0 relative">
            <img
              src={profile.profilePic}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white -mt-10 sm:-mt-12 object-cover shadow-sm relative"
            />
            <div className="mt-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words leading-tight">
                  {profile.firstName} {profile.lastName}
                </h1>
                <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                  Mentor
                </span>

                <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-sm">
                  <span className="inline-flex items-center gap-1.5 text-gray-700">
                    <Users size={15} className="text-gray-400" />
                    <span className="font-semibold text-gray-900">{stats.followersCount}</span>
                    <span className="text-gray-500">Followers</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-gray-700">
                    <Star size={15} className="text-amber-400 fill-amber-400" />
                    <span className="font-semibold text-gray-900">{stats.rating}</span>
                    <span className="text-gray-500">Rating</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-gray-700">
                    <ImageOff size={15} className="text-gray-400" />
                    <span className="font-semibold text-gray-900">{posts.length}</span>
                    <span className="text-gray-500">Posts</span>
                  </span>
                </div>
              </div>

              {!isOwner && (
                <button
                  onClick={
                    connectionStatus === "none" ? handleConnect : undefined
                  }
                  disabled={connectionStatus === "accepted"}
                  className={
                    connectionStatus === "accepted"
                      ? "shrink-0 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-sm transition-colors"
                      : `shrink-0 px-6 py-2.5 rounded-full text-white font-medium transition-colors shadow-sm ${
                          connectionStatus === "interested"
                            ? "bg-yellow-500"
                            : "bg-emerald-600 hover:bg-emerald-700"
                        }`
                  }
                >
                  {connectionStatus === "accepted" ? (
                    <>
                      <Check size={16} strokeWidth={2.75} />
                      Connected
                    </>
                  ) : connectionStatus === "interested" ? (
                    "REQUEST SENT"
                  ) : (
                    "CONNECT"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* OWNER ACTIONS */}
        {isOwner && !id && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-left cursor-pointer hover:shadow-md hover:border-emerald-200 transition-all"
            >
              <span className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <Sparkles size={18} className="text-emerald-600" />
              </span>
              <span>
                <span className="block font-semibold text-gray-900 text-sm">Share something</span>
                <span className="block text-xs text-gray-500 mt-0.5">Post a photo or video update</span>
              </span>
            </button>

            <button
              onClick={() => setShowCalendar((p) => !p)}
              className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-left cursor-pointer hover:shadow-md hover:border-emerald-200 transition-all"
            >
              <span className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <CalendarDays size={18} className="text-emerald-600" />
              </span>
              <span>
                <span className="block font-semibold text-gray-900 text-sm">My Calendar</span>
                <span className="block text-xs text-gray-500 mt-0.5">
                  {showCalendar ? "Hide schedule" : "Manage your sessions"}
                </span>
              </span>
            </button>
          </div>
        )}

        {showCalendar && <MentorCalendar />}

        {/* POSTS SECTION */}
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-semibold text-gray-900 text-sm sm:text-base">Posts</h2>
            <span className="text-xs text-gray-500">{posts.length} total</span>
          </div>

          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 px-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <span className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                <ImageOff size={20} className="text-gray-400" />
              </span>
              <p className="text-sm font-medium text-gray-700">No posts yet</p>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                {isOwner
                  ? "Share your first update to start building your presence."
                  : "This mentor hasn't posted anything yet."}
              </p>
              {isOwner && !id && (
                <button
                  onClick={() => setShowUpload(true)}
                  className="mt-4 px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
                >
                  Share something
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-0.5 sm:gap-1 bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
              {posts.map((post, i) => {
                const isVideo =
                  post.mediaUrl?.includes("/videos/") ||
                  post.mediaUrl?.endsWith(".mp4");

                return (
                  <button
                    key={post._id}
                    onClick={() => setActiveIndex(i)}
                    aria-label="Open post"
                    className="group relative aspect-square bg-gray-100 overflow-hidden cursor-pointer"
                  >
                    {isVideo ? (
                      <video
                        src={encodeURI(post.mediaUrl)}
                        muted
                        preload="metadata"
                        className="w-full h-full object-cover"
                      />
                    ) : post.mediaUrl ? (
                      <img
                        src={post.mediaUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageOff size={20} className="text-gray-300" />
                      </div>
                    )}
                    <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* POST VIEWER — vertical scroll through all posts, opens at the clicked one */}
        {activeIndex !== null && (
          <PostScrollViewer
            posts={posts}
            initialIndex={activeIndex}
            onClose={() => setActiveIndex(null)}
            authorName={`${profile.firstName} ${profile.lastName}`}
            authorPic={profile.profilePic}
            isOwner={isOwner}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
            onEditPost={(post) => {
              setEditingPost(post);
              setEditCaption(post.caption || "");
            }}
            onDeletePost={handleDeletePost}
          />
        )}

        {/* UPLOAD MODAL */}
        {showUpload && (
          <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-5 sm:p-6 rounded-xl w-full max-w-md relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowUpload(false)}
                aria-label="Close"
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>

              <h3 className="text-lg font-semibold mb-4 pr-8">Share something</h3>

              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full border border-gray-200 p-3 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-emerald-400 transition-shadow resize-none"
                rows={4}
                placeholder="Write something..."
              />

              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-emerald-50 file:text-emerald-700 file:font-medium hover:file:bg-emerald-100 file:cursor-pointer cursor-pointer"
              />

              <button
                onClick={handleUpload}
                disabled={uploading}
                className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-full font-medium disabled:opacity-60 transition-colors"
              >
                {uploading ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {editingPost && (
          <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-5 sm:p-6 rounded-xl w-full max-w-md relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setEditingPost(null)}
                aria-label="Close"
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>

              <h3 className="text-lg font-semibold mb-4 pr-8">Edit caption</h3>

              <textarea
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                className="w-full border border-gray-200 p-3 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-emerald-400 transition-shadow resize-none"
                rows={4}
              />

              <button
                onClick={handleSaveEdit}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-full font-medium transition-colors"
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
