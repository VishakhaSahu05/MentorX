import { useState } from "react";

// Colour is derived from the name so the same person always gets the same
// tile, the way Google products do it.
const PALETTE = [
  "bg-emerald-600",
  "bg-teal-600",
  "bg-sky-600",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-lime-600",
];

const colourFor = (name) => {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
};

const initialsOf = (firstName = "", lastName = "") =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";

/**
 * Profile photo when there is one, otherwise coloured initials. Also falls
 * back to initials if the photo fails to load (e.g. an expired LinkedIn URL).
 */
const MentorAvatar = ({ firstName, lastName, profilePic, className = "" }) => {
  const [broken, setBroken] = useState(false);

  if (profilePic && !broken) {
    return (
      <img
        src={profilePic}
        alt={firstName}
        onError={() => setBroken(true)}
        className={`rounded-full object-cover ${className}`}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className={`rounded-full flex items-center justify-center font-semibold text-white ${colourFor(
        `${firstName} ${lastName}`,
      )} ${className}`}
    >
      {initialsOf(firstName, lastName)}
    </div>
  );
};

export default MentorAvatar;
