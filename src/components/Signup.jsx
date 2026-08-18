import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { BASE_URL } from "../utils/constant";

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    emailId: "",
    password: "",
    role: "student",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        BASE_URL + "/signup",
        formData,
        { withCredentials: true }
      );
      dispatch(addUser(res.data));
      navigate("/profile");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Signup failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-lg bg-[#0b1f1a] border border-white/10 outline-none focus:ring-2 focus:ring-emerald-400 transition-shadow placeholder:text-gray-500";

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-24 bg-[#eefaf5]">
      <div className="w-full max-w-md bg-[#0f2f26] rounded-2xl p-6 sm:p-8 shadow-xl text-white">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-2">
          Create Account
        </h2>

        <p className="text-center text-gray-400 mb-6 text-sm sm:text-base">
          Join MentorX and start connecting
        </p>

        {error && (
          <p className="text-red-400 text-sm text-center mb-4 bg-red-400/10 border border-red-400/20 rounded-lg py-2 px-3">
            {error}
          </p>
        )}

        <form className="space-y-4 sm:space-y-5" onSubmit={handleSignup}>
          {/* FIRST NAME */}
          <input
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First Name"
            required
            className={inputClass}
          />

          {/* LAST NAME */}
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            required
            className={inputClass}
          />

          {/* EMAIL */}
          <input
            type="email"
            name="emailId"
            value={formData.emailId}
            onChange={handleChange}
            placeholder="Email"
            required
            className={inputClass}
          />

          {/* PASSWORD */}
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className={inputClass}
          />

          {/* ROLE */}
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold disabled:opacity-60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f2f26]"
          >
            {loading ? "Creating..." : "Sign up"}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
