import { useState } from "react";
import { useSelector } from "react-redux";

/**
 * Local, frontend-only comment state shared between a comments list and
 * its input composer. Nothing here is persisted or sent to the backend —
 * seed data plus anything typed locally, until a real comments API exists.
 */
export function usePostComments(seedComments = []) {
  const user = useSelector((store) => store.user);
  const [comments, setComments] = useState(seedComments);
  const [draft, setDraft] = useState("");

  const postComment = () => {
    if (!draft.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        name: user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "You",
        text: draft.trim(),
      },
    ]);
    setDraft("");
  };

  return { user, comments, draft, setDraft, postComment };
}
