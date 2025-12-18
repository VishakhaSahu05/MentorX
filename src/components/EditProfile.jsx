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

  return (
    <div className="min-h-screen bg-[#eefaf5] pt-32 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* LEFT : EDIT FORM ================= */}
        <div className="bg-[#0f2f26] rounded-2xl p-10 shadow-xl text-white">
          <h2 className="text-3xl font-semibold mb-2">Edit Profile</h2>
          <p className="text-gray-400 mb-8">
            Update your details and see how your profile will look in feed.
          </p>

          <input
            type="text"
            name="profilePic"
            value={profilePic}
            onChange={handleChange}
            placeholder="Profile picture URL"
            className="w-full mb-6 px-4 py-3 rounded-lg bg-[#0b1f1a] border border-white/10"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <input
              name="firstName"
              value={firstName}
              onChange={handleChange}
              placeholder="First Name"
              className="px-4 py-3 rounded-lg bg-[#0b1f1a] border border-white/10"
            />
            <input
              name="lastName"
              value={lastName}
              onChange={handleChange}
              placeholder="Last Name"
              className="px-4 py-3 rounded-lg bg-[#0b1f1a] border border-white/10"
            />
          </div>

          <select
            name="department"
            value={department}
            onChange={handleChange}
            className="w-full mb-6 px-4 py-3 rounded-lg bg-[#0b1f1a] border border-white/10 text-white"
          >
            <option value="">Select Department</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="AI">AI</option>
            <option value="ECE">ECE</option>
            <option value="CIVIL">CIVIL</option>
            <option value="OTHER">OTHER</option>
          </select>

          <input
            name="skills"
            value={skills}
            onChange={handleChange}
            placeholder="Skills (comma separated)"
            className="w-full mb-6 px-4 py-3 rounded-lg bg-[#0b1f1a] border border-white/10"
          />

          <input
            name="experience"
            value={experience}
            onChange={handleChange}
            placeholder="Experience (e.g. Amazon)"
            className="w-full mb-6 px-4 py-3 rounded-lg bg-[#0b1f1a] border border-white/10"
          />

          <textarea
            name="about"
            value={about}
            onChange={handleChange}
            rows="4"
            placeholder="About you"
            className="w-full mb-6 px-4 py-3 rounded-lg bg-[#0b1f1a] border border-white/10 resize-none"
          />

          {error && <p className="text-red-400 mb-3">{error}</p>}

          <button
            onClick={saveProfile}
            disabled={loading}
            className="w-full py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* ================= RIGHT : PREVIEW ================= */}
        <div className="flex justify-center mt-24 lg:mt-32">
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
  );
};

export default EditProfile;
