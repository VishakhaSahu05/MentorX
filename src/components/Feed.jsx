import axios from "axios";
import React, { useEffect, useState } from "react";
import { BASE_URL } from "../utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { addFeed, appendFeed, resetFeed } from "../utils/feedSlice";
import { useNavigate } from "react-router-dom";
import LeftSidebar from "../components/LeftSideBar";

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const user = useSelector((store) => store.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchFeed = async (pageNumber) => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/feed?page=${pageNumber}`,
        { withCredentials: true }
      );

      const posts = res.data.posts || [];

      if (pageNumber === 1) {
        dispatch(addFeed(posts));
      } else {
        dispatch(appendFeed(posts));
      }

      if (posts.length < 10) setHasMore(false);
    } catch (err) {
      console.error("Failed to load feed", err);
    } finally {
      setLoading(false);
    }
  };

  /* INITIAL LOAD */
  useEffect(() => {
    dispatch(resetFeed());
    fetchFeed(1);
  }, []);

  /* INFINITE SCROLL */
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight +
          document.documentElement.scrollTop +
          200 >=
        document.documentElement.scrollHeight
      ) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (page > 1) fetchFeed(page);
  }, [page]);

  return (
    <div className="min-h-screen bg-[#eefaf5] py-10">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* LEFT SIDEBAR – ONLY FOR STUDENT */}
        {user?.role === "student" && (
          <div className="hidden md:block md:col-span-1">
            <LeftSidebar />
          </div>
        )}

        {/* FEED */}
        <div
          className={
            user?.role === "student"
              ? "md:col-span-3"
              : "md:col-span-4"
          }
        >
          <h1 className="text-3xl font-semibold mb-10 text-[#0b1f1a]">
            Feed
          </h1>

          {feed.length === 0 && !loading && (
            <p className="text-center text-gray-500">
              No posts available right now
            </p>
          )}

          {feed.map((post) => {
            const isVideo = post.mediaType === "video";

            return (
              <div
                key={post._id}
                className="mb-12 bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                {/* HEADER */}
                <div
                  className="flex items-center gap-3 px-6 py-4 cursor-pointer"
                  onClick={() =>
                    navigate(`/mentor/${post.mentor._id}`)
                  }
                >
                  <img
                    src={
                      post.mentor?.profilePic ||
                      "/default-avatar.png"
                    }
                    alt="mentor"
                    className="w-11 h-11 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-[#0b1f1a] leading-none">
                      {post.mentor?.firstName}{" "}
                      {post.mentor?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Mentor
                    </p>
                  </div>
                </div>

                {/* MEDIA */}
                <div className="w-full aspect-[4/3] bg-black">
                  {isVideo ? (
                    <video
                      src={post.mediaUrl}
                      controls
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={post.mediaUrl}
                      alt="post"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* CAPTION */}
                {post.caption && (
                  <div className="px-6 py-4">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {post.caption}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <p className="text-center text-gray-500">
              Loading...
            </p>
          )}

          {!hasMore && feed.length > 0 && (
            <p className="text-center text-gray-400 mt-6">
              You have reached the end
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;
