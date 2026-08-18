import axios from "axios";
import React, { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import { BASE_URL } from "../utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { addFeed, appendFeed, resetFeed } from "../utils/feedSlice";
import { useNavigate } from "react-router-dom";
import LeftSidebar from "../components/LeftSideBar";
import SuggestedMentors from "../components/SuggestedMentors";
import ExploreTopics from "../components/ExploreTopics";
import PostFeedCard from "../components/PostFeedCard";

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
    <div className="min-h-screen bg-[#eefaf5] pt-24 sm:pt-28 pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-6 justify-center">

        {/* LEFT SIDEBAR – ONLY FOR STUDENT */}
        {user?.role === "student" && (
          <div className="hidden md:flex md:flex-col gap-5 w-72 shrink-0">
            <LeftSidebar />
            <SuggestedMentors />
            <ExploreTopics />
          </div>
        )}

        {/* FEED */}
        <div className="w-full max-w-[640px] min-w-0">
          <div className="flex items-baseline justify-between mb-5 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#0b1f1a]">
              Feed
            </h1>
            {feed.length > 0 && (
              <span className="text-sm text-gray-500">{feed.length} posts</span>
            )}
          </div>

          {feed.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <span className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                <ImageOff size={20} className="text-gray-400" />
              </span>
              <p className="text-sm font-medium text-gray-700">No posts available right now</p>
              <p className="text-xs text-gray-500 mt-1">Check back later for updates from mentors.</p>
            </div>
          )}

          {feed.map((post) => (
            <PostFeedCard
              key={post._id}
              post={post}
              authorName={`${post.mentor?.firstName || ""} ${post.mentor?.lastName || ""}`.trim()}
              authorPic={post.mentor?.profilePic}
              onAuthorClick={() => navigate(`/mentor/${post.mentor._id}`)}
              className="mb-5 sm:mb-6"
            />
          ))}

          {loading && (
            <p className="text-center text-gray-500 py-4">
              Loading...
            </p>
          )}

          {!hasMore && feed.length > 0 && (
            <p className="text-center text-gray-400 text-sm mt-2 pb-4">
              You have reached the end
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;
