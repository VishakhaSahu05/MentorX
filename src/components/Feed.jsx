import axios from "axios";
import React, { useEffect, useState } from "react";
import { BASE_URL } from "../utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { addFeed, appendFeed, resetFeed } from "../utils/feedSlice";

const Feed = () => {
  const feed = useSelector((store) => store.feed); // array of posts
  const dispatch = useDispatch();

  const [page, setPage] = useState(1); //konsa page fetch krna
  const [loading, setLoading] = useState(false); //duplicate APIs call avoid
  const [hasMore, setHasMore] = useState(true); //last page aa chuka hai ya nhi

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

      if (posts.length < 10) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load feed", err);
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    dispatch(resetFeed());
    fetchFeed(1);
  }, []);

  // infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 100 >=
        document.documentElement.scrollHeight
      ) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (page > 1) {
      fetchFeed(page);
    }
  }, [page]);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-semibold mb-8 text-[#0b1f1a]">
        Feed
      </h1>

      {/* Empty */}
      {!loading && feed.length === 0 && (
        <p className="text-gray-500 text-center">
          No posts available right now
        </p>
      )}

      {/* Posts */}
      {feed.map((post) => (
        <div
          key={post._id}
          className="mb-10 bg-white rounded-2xl shadow-md overflow-hidden"
        >
          {/* Mentor header */}
          <div className="flex items-center gap-4 p-4">
            <img
              src={post.mentor.profilePic || "/default-avatar.png"}
              alt="mentor"
              className="w-12 h-12 rounded-full object-cover"
            />
            <h2 className="font-semibold text-[#0b1f1a]">
              {post.mentor.firstName} {post.mentor.lastName}
            </h2>
          </div>

          {/* Media */}
          <img
            src={post.mediaUrl}
            alt="post"
            className="w-full object-cover"
          />

          {/* Caption */}
          {post.caption && (
            <p className="p-4 text-gray-700">{post.caption}</p>
          )}
        </div>
      ))}

      {/* Loading */}
      {loading && (
        <p className="text-center text-gray-500">Loading...</p>
      )}

      {/* End */}
      {!hasMore && (
        <p className="text-center text-gray-400 mt-6">
          You have reached the end
        </p>
      )}
    </div>
  );
};

export default Feed;
