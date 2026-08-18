import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { BASE_URL } from "../utils/constant";
import { addUser } from "../utils/userSlice";
import PreviewCard from "./PreviewCard";

const EditProfile = ({ user }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState(() => ({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    department: user?.department || "",
    skills: user?.skills?.join(", ") || "",
    experience: user?.experience || "",
    about: user?.about || "",
    profilePic: user?.profilePic || "",
  }));

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    firstName,
    lastName,
    department,
    skills,
    experience,
    about,
    profilePic,
  } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.patch(
        `${BASE_URL}/profile/edit`,
        {
          firstName,
          lastName,
          department,
          skills: skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          experience,
          about,
          profilePic,
        },
        {
          withCredentials: true,
        }
      );

      //Redux store update
      dispatch(addUser(res.data.data));

      alert("Profile updated successfully");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    "w-full px-4 py-3 rounded-lg bg-[#0b1f1a] border border-white/10 outline-none focus:ring-2 focus:ring-emerald-400 transition-shadow placeholder:text-gray-500";

  const sectionLabelClass =
    "text-xs font-semibold uppercase tracking-wider text-emerald-400/80 mb-3";

  return (
    <div className="min-h-screen bg-[#eefaf5] pt-24 sm:pt-28 lg:pt-32 px-4 sm:px-6 pb-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8 text-center lg:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0b1f1a]">Edit Profile</h1>
          <p className="text-gray-500 text-sm sm:text-base mt-1">
            Update your details and see how your profile will look in feed.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">

        {/* LEFT : EDIT FORM ================= */}
        <div className="bg-[#0f2f26] rounded-2xl p-6 sm:p-8 shadow-xl text-white space-y-6">

          {/* BASIC INFO */}
          <div>
            <p className={sectionLabelClass}>Basic Info</p>
            <div className="space-y-4">
              <input
                type="text"
                name="profilePic"
                value={profilePic}
                onChange={handleChange}
                placeholder="Profile picture URL"
                className={fieldClass}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  name="firstName"
                  value={firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  className={fieldClass}
                />
                <input
                  name="lastName"
                  value={lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className={fieldClass}
                />
              </div>

              <select
                name="department"
                value={department}
                onChange={handleChange}
                className={fieldClass}
              >
                <option value="">Select Department</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="AI">AI</option>
                <option value="ECE">ECE</option>
                <option value="CIVIL">CIVIL</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
          </div>

          <div className="h-px bg-white/10" />

          {/* BACKGROUND */}
          <div>
            <p className={sectionLabelClass}>Background</p>
            <div className="space-y-4">
              <input
                name="skills"
                value={skills}
                onChange={handleChange}
                placeholder="Skills (comma separated)"
                className={fieldClass}
              />

              <input
                name="experience"
                value={experience}
                onChange={handleChange}
                placeholder="Experience (e.g. Amazon)"
                className={fieldClass}
              />

              <textarea
                name="about"
                value={about}
                onChange={handleChange}
                rows="4"
                placeholder="About you"
                className={`${fieldClass} resize-none`}
              />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg py-2 px-3">
              {error}
            </p>
          )}

          <button
            onClick={saveProfile}
            disabled={loading}
            className="w-full py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold disabled:opacity-60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f2f26]"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* ================= RIGHT : PREVIEW ================= */}
        <div className="flex flex-col items-center lg:items-start">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 self-center lg:self-start">
            Live Preview
          </p>
          <PreviewCard
            firstName={firstName}
            lastName={lastName}
            department={department}
            skills={skills}
            experience={experience}
            profilePic={profilePic}
          />
        </div>

        </div>
      </div>
    </div>
  );
};

export default EditProfile;
