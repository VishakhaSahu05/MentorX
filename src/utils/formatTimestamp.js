// Formats a post's createdAt into an Instagram-style relative label.
// Falls back gracefully to "Recently" until a real timestamp field is confirmed.
export function formatTimestamp(createdAt) {
  if (!createdAt) return "Recently";
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "Recently";

  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
