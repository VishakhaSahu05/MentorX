/**
 * Instagram-style comments list (+ optional inline composer).
 *
 * Purely presentational — all comment state/actions are passed in from
 * `usePostComments` so a list and its input can be laid out independently
 * (e.g. list scrolls, input stays pinned) while still sharing one source
 * of truth. UI-only: nothing here is persisted or sent to the backend.
 */
const PostComments = ({
  comments,
  variant = "preview",
  showInput = true,
  draft,
  setDraft,
  postComment,
  user,
  inputRef,
}) => {
  const visibleComments = variant === "preview" ? comments.slice(-1) : comments;

  return (
    <div className="flex flex-col">
      {variant === "preview" && comments.length > 1 && (
        <button
          type="button"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors text-left mb-1"
        >
          View all {comments.length} comments
        </button>
      )}

      {visibleComments.length > 0 && (
        <div className={variant === "preview" ? "space-y-0.5" : "space-y-2.5"}>
          {visibleComments.map((c) => (
            <p key={c.id} className="text-sm text-gray-800 leading-relaxed break-words">
              <span className="font-semibold text-[#0b1f1a] mr-1.5">{c.name}</span>
              {c.text}
            </p>
          ))}
        </div>
      )}

      {showInput && (
        <PostCommentInput
          draft={draft}
          setDraft={setDraft}
          postComment={postComment}
          user={user}
          inputRef={inputRef}
          className="mt-3 pt-3 border-t border-gray-100"
        />
      )}
    </div>
  );
};

export const PostCommentInput = ({ draft, setDraft, postComment, user, inputRef, className = "" }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <img
      src={user?.profilePic || "/default-avatar.png"}
      alt=""
      className="w-7 h-7 rounded-full object-cover shrink-0"
    />
    <div className="flex-1 min-w-0 flex items-center gap-2 border border-gray-200 rounded-full pl-3.5 pr-1.5 py-1.5 focus-within:border-gray-400 transition-colors">
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && postComment()}
        placeholder="Add a comment..."
        className="flex-1 min-w-0 text-sm outline-none placeholder:text-gray-400 bg-transparent"
      />
      <button
        onClick={postComment}
        disabled={!draft.trim()}
        className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors shrink-0 px-1"
      >
        Post
      </button>
    </div>
  </div>
);

export default PostComments;
