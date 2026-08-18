import { useRef } from "react";
import { MoreHorizontal } from "lucide-react";
import PostActionBar from "./PostActionBar";
import PostComments, { PostCommentInput } from "./PostComments";
import { usePostComments } from "../hooks/usePostComments";
import { formatTimestamp } from "../utils/formatTimestamp";

// UI-only placeholder — no backend like/comment data exists yet.
const DEFAULT_SEED_COMMENTS = [
  { id: "seed-1", name: "Ananya Sharma", text: "Congratulations! 🎉" },
];

/**
 * Instagram-style feed post card — full-width header/image/actions/caption.
 *
 * Shared between Feed.jsx (author = post.mentor) and MentorDashboard.jsx
 * (author = the profile being viewed) so both reuse the same markup instead
 * of duplicating it. Purely presentational: media/caption come from the
 * existing post object, likes/comments are local UI-only state via
 * usePostComments (same as everywhere else this pattern is used).
 */
const PostFeedCard = ({
  post,
  authorName,
  authorPic,
  authorLabel = "Mentor",
  onAuthorClick,
  onMoreClick,
  onMediaClick,
  initialLikes = 24,
  seedComments = DEFAULT_SEED_COMMENTS,
  className = "",
}) => {
  const isVideo =
    post.mediaType === "video" ||
    post.mediaUrl?.includes("/videos/") ||
    post.mediaUrl?.endsWith(".mp4");

  const commentInputRef = useRef(null);
  const { user, comments, draft, setDraft, postComment } = usePostComments(seedComments);

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${className}`}>
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div
          className={`flex items-center gap-3 min-w-0 ${onAuthorClick ? "cursor-pointer" : ""}`}
          onClick={onAuthorClick}
        >
          <img
            src={authorPic || "/default-avatar.png"}
            alt=""
            className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-gray-100"
          />
          <div className="min-w-0">
            <p className={`font-semibold text-[#0b1f1a] leading-tight truncate text-sm ${onAuthorClick ? "hover:underline" : ""}`}>
              {authorName}
            </p>
            <p className="text-xs text-emerald-700 font-medium leading-tight">
              {authorLabel}
            </p>
          </div>
        </div>

        <button
          onClick={onMoreClick}
          aria-label="More options"
          className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <MoreHorizontal size={18} className="text-gray-500" />
        </button>
      </div>

      {/* MEDIA */}
      <div
        className={`w-full aspect-[4/3] max-h-[520px] bg-black ${onMediaClick ? "cursor-pointer" : ""}`}
        onClick={onMediaClick}
      >
        {isVideo ? (
          <video
            src={encodeURI(post.mediaUrl)}
            controls
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-contain bg-black"
          />
        ) : (
          <img src={post.mediaUrl} alt="post" className="w-full h-full object-cover" />
        )}
      </div>

      {/* ACTIONS + CAPTION + COMMENTS */}
      <div className="px-4 py-3 space-y-2">
        <PostActionBar
          initialLikes={initialLikes}
          onCommentClick={() => commentInputRef.current?.focus()}
        />

        {post.caption && (
          <p className="text-sm text-gray-800 leading-relaxed break-words">
            <span className="font-semibold text-[#0b1f1a] mr-1.5">{authorName}</span>
            {post.caption}
          </p>
        )}

        <PostComments comments={comments} variant="preview" showInput={false} />

        <p className="text-[11px] uppercase tracking-wide text-gray-400">
          {formatTimestamp(post.createdAt)}
        </p>

        <PostCommentInput
          draft={draft}
          setDraft={setDraft}
          postComment={postComment}
          user={user}
          inputRef={commentInputRef}
          className="pt-2 border-t border-gray-100"
        />
      </div>
    </div>
  );
};

export default PostFeedCard;
