import { useRef } from "react";
import { X, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import PostActionBar from "./PostActionBar";
import PostComments, { PostCommentInput } from "./PostComments";
import { usePostComments } from "../hooks/usePostComments";
import { formatTimestamp } from "../utils/formatTimestamp";

/**
 * Instagram-style post detail viewer.
 *
 * Desktop: two-panel (image left ~58%, info right).
 * Mobile: single column, image on top, info below.
 *
 * Purely presentational — activeIndex/posts/menu/edit/delete all come
 * from MentorDashboard's existing state and handlers, unchanged.
 */
const PostDetailModal = ({
  posts,
  activeIndex,
  onClose,
  onNavigate,
  profile,
  isOwner,
  openMenuId,
  setOpenMenuId,
  onEditPost,
  onDeletePost,
}) => {
  const post = posts[activeIndex];
  const commentInputRef = useRef(null);
  const { user, comments, draft, setDraft, postComment } = usePostComments(MOCK_COMMENTS);

  if (!post) return null;

  const isVideo =
    post.mediaUrl?.endsWith(".mp4") || post.mediaUrl?.includes("/videos/");

  const canPrev = activeIndex > 0;
  const canNext = activeIndex < posts.length - 1;

  return (
    <div
      className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-3xl lg:max-w-4xl bg-white sm:rounded-xl shadow-xl overflow-hidden flex flex-col sm:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* PREV / NEXT (desktop + tablet) */}
        {canPrev && (
          <button
            onClick={() => onNavigate(activeIndex - 1)}
            aria-label="Previous post"
            className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        {canNext && (
          <button
            onClick={() => onNavigate(activeIndex + 1)}
            aria-label="Next post"
            className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        )}

        {/* MOBILE HEADER (Instagram-style top bar) */}
        <div className="flex sm:hidden items-center justify-between gap-2 px-3 py-2.5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={profile.profilePic}
              alt=""
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
                {profile.firstName} {profile.lastName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {isOwner && (
              <div className="relative">
                <button
                  onClick={() => setOpenMenuId(openMenuId === post._id ? null : post._id)}
                  aria-label="More options"
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <MoreHorizontal size={18} className="text-gray-700" />
                </button>
                {openMenuId === post._id && (
                  <PostOwnerMenu post={post} onEditPost={onEditPost} onDeletePost={onDeletePost} setOpenMenuId={setOpenMenuId} />
                )}
              </div>
            )}
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} className="text-gray-700" />
            </button>
          </div>
        </div>

        {/* IMAGE (left ~58% on desktop, top on mobile) */}
        <div className="relative w-full sm:w-[58%] bg-black flex items-center justify-center shrink-0 aspect-square sm:aspect-auto max-h-[42vh] sm:max-h-[85vh]">
          {isVideo ? (
            <video
              src={encodeURI(post.mediaUrl)}
              controls
              preload="metadata"
              playsInline
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            <img
              src={post.mediaUrl}
              alt=""
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* INFO PANEL (right on desktop, below image on mobile) */}
        <div className="flex flex-col w-full sm:w-[42%] min-h-0 flex-1 sm:max-h-[85vh]">
          {/* DESKTOP HEADER */}
          <div className="hidden sm:flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={profile.profilePic}
                alt=""
                className="w-9 h-9 rounded-full object-cover shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
                  {profile.firstName} {profile.lastName}
                </p>
                <p className="text-xs text-emerald-700 font-medium">Mentor</p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {isOwner && (
                <div className="relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === post._id ? null : post._id)}
                    aria-label="More options"
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <MoreHorizontal size={18} className="text-gray-500" />
                  </button>
                  {openMenuId === post._id && (
                    <PostOwnerMenu post={post} onEditPost={onEditPost} onDeletePost={onDeletePost} setOpenMenuId={setOpenMenuId} />
                  )}
                </div>
              )}
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* SCROLLABLE BODY: caption + comments */}
          <div className="flex-1 overflow-y-auto min-h-0 px-4 py-3 space-y-3">
            {post.caption && (
              <p className="text-sm text-gray-800 leading-relaxed break-words">
                <span className="font-semibold text-[#0b1f1a] mr-1.5">
                  {profile.firstName}
                </span>
                {post.caption}
              </p>
            )}

            <PostComments comments={comments} variant="full" showInput={false} />
          </div>

          {/* ACTIONS + LIKES + TIMESTAMP + COMPOSER */}
          <div className="border-t border-gray-100 shrink-0">
            <div className="px-4 pt-3">
              <PostActionBar
                initialLikes={MOCK_LIKES}
                onCommentClick={() => commentInputRef.current?.focus()}
              />
              <p className="text-[11px] uppercase tracking-wide text-gray-400 mt-1.5">
                {formatTimestamp(post.createdAt)}
              </p>
            </div>
            <PostCommentInput
              draft={draft}
              setDraft={setDraft}
              postComment={postComment}
              user={user}
              inputRef={commentInputRef}
              className="px-4 py-3"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const PostOwnerMenu = ({ post, onEditPost, onDeletePost, setOpenMenuId }) => (
  <div className="absolute right-0 mt-2 bg-white shadow-lg border border-gray-100 rounded-lg w-36 z-50 overflow-hidden">
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
);

// UI-only placeholders — no backend like/comment data exists yet.
const MOCK_LIKES = 24;
const MOCK_COMMENTS = [
  { id: "seed-1", name: "Ananya Sharma", text: "Congratulations! 🎉" },
];

export default PostDetailModal;
