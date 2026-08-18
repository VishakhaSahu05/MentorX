import { useState } from "react";
import { Heart, MessageCircle, Send } from "lucide-react";

/**
 * Instagram-style like/comment/share action bar.
 *
 * UI-only: likes and the "liked" state are local to this component.
 * `initialLikes` seeds a display count (mocked until a real likes API
 * exists) so it stays trivial to swap for real data later.
 */
const PostActionBar = ({ initialLikes = 0, onCommentClick, onShareClick, className = "" }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikes);

  const toggleLike = () => {
    setLiked((prev) => {
      const next = !prev;
      setLikeCount((count) => (next ? count + 1 : Math.max(0, count - 1)));
      return next;
    });
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center gap-3.5 -ml-1.5">
        <button
          onClick={toggleLike}
          aria-label={liked ? "Unlike" : "Like"}
          aria-pressed={liked}
          className="p-1.5 cursor-pointer active:scale-90 transition-transform"
        >
          <Heart
            size={23}
            className={liked ? "text-red-500 fill-red-500" : "text-gray-700 hover:text-gray-400 transition-colors"}
          />
        </button>

        <button
          onClick={onCommentClick}
          aria-label="Comment"
          className="p-1.5 cursor-pointer active:scale-90 transition-transform"
        >
          <MessageCircle size={23} className="text-gray-700 hover:text-gray-400 transition-colors" />
        </button>

        {onShareClick && (
          <button
            onClick={onShareClick}
            aria-label="Share"
            className="p-1.5 cursor-pointer active:scale-90 transition-transform"
          >
            <Send size={21} className="text-gray-700 hover:text-gray-400 transition-colors" />
          </button>
        )}
      </div>

      <p className="text-sm font-semibold text-gray-900 mt-0.5">
        {likeCount.toLocaleString()} {likeCount === 1 ? "like" : "likes"}
      </p>
    </div>
  );
};

export default PostActionBar;
