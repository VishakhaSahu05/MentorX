import { useEffect, useLayoutEffect, useRef } from "react";
import { X, MoreHorizontal } from "lucide-react";
import PostActionBar from "./PostActionBar";
import PostComments, { PostCommentInput } from "./PostComments";
import { usePostComments } from "../hooks/usePostComments";
import { formatTimestamp } from "../utils/formatTimestamp";

// UI-only placeholders — no backend like/comment data exists yet.
const MOCK_LIKES = 24;
const MOCK_COMMENTS = [
  { id: "seed-1", name: "Ananya Sharma", text: "Congratulations! 🎉" },
];

/**
 * Instagram-style full-screen post viewer: every post from the profile
 * stacked in one vertically scrollable column over a dark overlay. Opens
 * already scrolled to the clicked post; scrolling (not prev/next buttons)
 * is the only navigation.
 *
 * Purely presentational — posts/activeIndex-derived initialIndex/menu/edit/
 * delete all come from MentorDashboard's existing state and handlers,
 * unchanged. Reuses PostActionBar/PostComments as-is (their light card
 * styling included) so Like/Comment stay the same local-only UI behavior
 * without a duplicate/forked implementation.
 */
const PostScrollViewer = ({
  posts,
  initialIndex,
  onClose,
  authorName,
  authorPic,
  isOwner,
  openMenuId,
  setOpenMenuId,
  onEditPost,
  onDeletePost,
}) => {
  const itemRefs = useRef([]);

  // Jump to the clicked post immediately on open — no animation, no scroll-in.
  useLayoutEffect(() => {
    itemRefs.current[initialIndex]?.scrollIntoView({ block: "start" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95">
      {/* CLOSE — floats over the dark viewer, always reachable */}
      <button
        onClick={onClose}
        aria-label="Close"
        className="fixed top-3 right-3 sm:top-5 sm:right-5 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <X size={18} />
      </button>

      {/* Scroll surface fills the whole viewport — no nested white card, no boxed scrollbar */}
      <div className="hide-scrollbar h-full overflow-y-auto scroll-smooth">
        <div className="flex flex-col items-center gap-2 sm:gap-8 py-0 sm:py-10 px-0 sm:px-4">
          {posts.map((post, i) => (
            <PostScrollItem
              key={post._id}
              ref={(el) => (itemRefs.current[i] = el)}
              post={post}
              authorName={authorName}
              authorPic={authorPic}
              isOwner={isOwner}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              onEditPost={onEditPost}
              onDeletePost={onDeletePost}
            />
          ))}
        </div>
      </div>

      <style>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

const PostScrollItem = ({
  post,
  authorName,
  authorPic,
  isOwner,
  openMenuId,
  setOpenMenuId,
  onEditPost,
  onDeletePost,
  ref,
}) => {
  const isVideo =
    post.mediaUrl?.endsWith(".mp4") || post.mediaUrl?.includes("/videos/");

  const commentInputRef = useRef(null);
  const { user, comments, draft, setDraft, postComment } = usePostComments(MOCK_COMMENTS);

  return (
    <div
      ref={ref}
      className="w-full sm:w-full sm:max-w-lg bg-white sm:rounded-xl overflow-hidden flex flex-col justify-center sm:min-h-0 min-h-screen"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={authorPic || "/default-avatar.png"}
            alt=""
            className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-gray-100"
          />
          <div className="min-w-0">
            <p className="font-semibold text-[#0b1f1a] leading-tight truncate text-sm">
              {authorName}
            </p>
            <p className="text-xs text-emerald-700 font-medium leading-tight">Mentor</p>
          </div>
        </div>

        {isOwner && (
          <div className="relative shrink-0">
            <button
              onClick={() => setOpenMenuId(openMenuId === post._id ? null : post._id)}
              aria-label="More options"
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <MoreHorizontal size={18} className="text-gray-500" />
            </button>
            {openMenuId === post._id && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg border border-gray-100 rounded-lg w-36 z-30 overflow-hidden">
                <button
                  onClick={() => {
                    onEditPost(post);
                    setOpenMenuId(null);
                  }}
                  className="block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeletePost(post._id)}
                  className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MEDIA */}
      <div className="w-full aspect-square bg-black">
        {isVideo ? (
          <video
            src={encodeURI(post.mediaUrl)}
            controls
            preload="metadata"
            playsInline
            className="w-full h-full object-contain bg-black"
          />
        ) : (
          <img src={post.mediaUrl} alt="" className="w-full h-full object-cover" />
        )}
      </div>

      {/* ACTIONS + CAPTION + COMMENTS */}
      <div className="px-4 py-3 space-y-2">
        <PostActionBar
          initialLikes={MOCK_LIKES}
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

export default PostScrollViewer;
