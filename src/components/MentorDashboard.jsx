import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constant";
import { useSelector, useDispatch } from "react-redux";
import { addConnections } from "../utils/connectionSlice";

export default function MentorDashboard() {
  const dispatch = useDispatch();

  const user = useSelector((store) => store.user);
  const connections = useSelector((store) => store.connection || []);
  const followersCount = connections.length;

  
  const [posts, setPosts] = useState([]);
  const [creatingPost, setCreatingPost] = useState(false);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [activePostIndex, setActivePostIndex] = useState(null);

  const [openMenuPostId, setOpenMenuPostId] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editCaption, setEditCaption] = useState("");

  
  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});

  /*FETCH POSTS */
  useEffect(() => {
    const fetchMyPosts = async () => {
      const res = await axios.get(BASE_URL + "/my-posts", {
        withCredentials: true,
      });
      setPosts(res.data.posts || []);
    };
    fetchMyPosts();
  }, []);

  /* FETCH FOLLOWERS */
  useEffect(() => {
    const fetchConnections = async () => {
      const res = await axios.get(BASE_URL + "/user/connection", {
        withCredentials: true,
      });
      dispatch(addConnections(res.data.connections || []));
    };
    fetchConnections();
  }, [dispatch]);

  /* CREATE POST  */
  const handleCreatePost = async () => {
    if (!file) return alert("Please select a file");

    setUploading(true);
    const fd = new FormData();
    fd.append("media", file);
    fd.append("caption", caption);

    const res = await axios.post(BASE_URL + "/upload", fd, {
      withCredentials: true,
    });

    setPosts((p) => [res.data, ...p]);
    setFile(null);
    setCaption("");
    setCreatingPost(false);
    setUploading(false);
  };

  /*Delete Post */
  const handleDeletePost = async (id) => {
    if (!window.confirm("Delete this post?")) return;

    await axios.delete(BASE_URL + `/post/${id}`, {
      withCredentials: true,
    });

    setPosts((p) => p.filter((x) => x._id !== id));
    setActivePostIndex(null);
    setOpenMenuPostId(null);
  };

  /* Edit Post */
  const handleEditPost = async () => {
    const res = await axios.patch(
      BASE_URL + `/post/${editingPost._id}`,
      { caption: editCaption },
      { withCredentials: true }
    );

    setPosts((p) => p.map((x) => (x._id === editingPost._id ? res.data : x)));
    setEditingPost(null);
  };

  return (
    <div className="bg-[#f3f2ef] min-h-screen pt-20">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profile*/}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="h-36 bg-linear-to-r from-emerald-900 to-emerald-600" />
          <div className="p-6 relative">
            <img
              src={user?.profilePic || "/default-avatar.png"}
              className="w-28 h-28 rounded-full border-4 border-white absolute -top-14"
            />
            <div className="mt-16">
              <h1 className="text-2xl font-bold">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-sm text-gray-600">Mentor</p>
              <div className="flex gap-6 mt-2 text-sm text-gray-600">
                <span>{followersCount} Followers</span>
                <span>⭐ 4.6 Rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Post Card */}
        <div
          onClick={() => setCreatingPost(true)}
          className="bg-white rounded-xl shadow p-4 flex gap-3 cursor-pointer hover:bg-gray-50"
        >
          <img src={user?.profilePic} className="w-12 h-12 rounded-full" />
          <div className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-gray-500">
            ✨ Share something with your students
          </div>
        </div>

        {/* Calendar Card */}
        <div
          onClick={() => setOpenCalendar(true)}
          className="bg-white rounded-xl shadow p-4 flex gap-3 cursor-pointer hover:bg-gray-50"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-xl">
            📅
          </div>
          <div>
            <p className="font-semibold">Schedule availability</p>
            <p className="text-sm text-gray-500">Let students book sessions</p>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {posts.map((p, i) => (
            <div
              key={p._id}
              onClick={() => setActivePostIndex(i)}
              className="bg-white rounded-lg shadow overflow-hidden cursor-pointer"
            >
              <img src={p.mediaUrl} className="w-full h-40 object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Post Modal*/}
      {creatingPost && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl w-[90%] max-w-xl p-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-3">
              <img src={user?.profilePic} className="w-10 h-10 rounded-full" />
              <p className="font-semibold">
                {user?.firstName} {user?.lastName}
              </p>
              <button
                onClick={() => setCreatingPost(false)}
                className="ml-auto text-xl"
              >
                ✕
              </button>
            </div>

            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Share something…"
              className="w-full border rounded-lg p-3 mb-3"
              rows={4}
            />

            <input
              type="file"
              id="fileUpload"
              accept="image/*,video/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
            />

            <label
              htmlFor="fileUpload"
              className="block text-center border rounded-lg py-2 cursor-pointer hover:bg-gray-100"
            >
              📎 Add photo / video
            </label>

            {file && (
              <img
                src={URL.createObjectURL(file)}
                className="mt-3 rounded-lg max-h-60 mx-auto"
              />
            )}

            <button
              onClick={handleCreatePost}
              disabled={uploading}
              className="mt-4 w-full bg-emerald-600 text-white py-2 rounded-lg"
            >
              {uploading ? "Posting…" : "Post"}
            </button>
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      {openCalendar && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl w-[90%] max-w-lg p-6">
            <h2 className="text-lg font-semibold mb-4">
              📅 Schedule Availability
            </h2>

            <div className="grid grid-cols-7 gap-3 text-center">
              {Array.from({ length: 30 }).map((_, i) => {
                const d = i + 1;
                const active = selectedDates.includes(d);
                return (
                  <div
                    key={d}
                    onClick={() =>
                      setSelectedDates((p) =>
                        p.includes(d) ? p.filter((x) => x !== d) : [...p, d]
                      )
                    }
                    className={`border rounded-lg py-3 cursor-pointer ${
                      active
                        ? "bg-emerald-500 text-white"
                        : "hover:bg-emerald-50"
                    }`}
                  >
                    {d}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setOpenCalendar(false)}
              className="mt-4 w-full bg-emerald-600 text-white py-2 rounded-lg"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* insta post view */}
      {activePostIndex !== null && (
        <div
          className="fixed inset-0 bg-black/80 z-50 overflow-y-auto"
          onClick={() => setActivePostIndex(null)}
        >
          <div
            className="max-w-3xl mx-auto py-10 space-y-10"
            onClick={(e) => e.stopPropagation()}
          >
            {posts.map((post) => (
              <div key={post._id} className="bg-white rounded-xl shadow">
                <div className="flex items-center gap-3 p-4 border-b relative">
                  <img
                    src={user?.profilePic}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">Mentor</p>
                  </div>

                  <button
                    onClick={() =>
                      setOpenMenuPostId(
                        openMenuPostId === post._id ? null : post._id
                      )
                    }
                    className="text-xl"
                  >
                    ⋮
                  </button>

                  {openMenuPostId === post._id && (
                    <div className="absolute right-4 top-12 bg-white border rounded-lg shadow w-32">
                      <button
                        onClick={() => {
                          setEditingPost(post);
                          setEditCaption(post.caption || "");
                          setOpenMenuPostId(null);
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

                <img
                  src={post.mediaUrl}
                  className="w-full max-h-[75vh] object-contain bg-black"
                />

                {/* LIKE + COMMENT */}
                <div className="p-4">
                  <div className="flex gap-4 text-2xl mb-2">
                    <button
                      onClick={() =>
                        setLikes((p) => ({
                          ...p,
                          [post._id]: !p[post._id],
                        }))
                      }
                    >
                      {likes[post._id] ? "❤️" : "🤍"}
                    </button>
                    💬
                  </div>

                  {post.caption && (
                    <p className="text-sm mb-2">
                      <span className="font-semibold mr-1">
                        {user?.firstName}
                      </span>
                      {post.caption}
                    </p>
                  )}

                  {(comments[post._id] || []).map((c, i) => (
                    <p key={i} className="text-sm text-gray-700">
                      <span className="font-semibold mr-1">
                        {user?.firstName}
                      </span>
                      {c}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingPost && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl w-[90%] max-w-md p-4">
            <textarea
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
              className="w-full border rounded-lg p-3"
              rows={4}
            />
            <button
              onClick={handleEditPost}
              className="mt-4 w-full bg-emerald-600 text-white py-2 rounded-lg"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
