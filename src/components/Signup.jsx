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

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-[#eefaf5]">
      <div className="w-full max-w-md bg-[#0f2f26] rounded-2xl p-8 shadow-xl text-white">
        <h2 className="text-3xl font-semibold text-center mb-2">
          Create Account
        </h2>

        <p className="text-center text-gray-400 mb-6">
          Join MentorX and start connecting
        </p>

        {error && (
          <p className="text-red-400 text-sm text-center mb-4">
            {error}
          </p>
        )}

        <form className="space-y-5" onSubmit={handleSignup}>
          {/* FIRST NAME */}
          <input
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First Name"
            required
            className="w-full px-4 py-3 rounded-lg bg-[#0b1f1a]"
          />

          {/* LAST NAME */}
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            required
            className="w-full px-4 py-3 rounded-lg bg-[#0b1f1a]"
          />

          {/* EMAIL */}
          <input
            type="email"
            name="emailId"
            value={formData.emailId}
            onChange={handleChange}
            placeholder="Email"
            required
            className="w-full px-4 py-3 rounded-lg bg-[#0b1f1a]"
          />

          {/* PASSWORD */}
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="w-full px-4 py-3 rounded-lg bg-[#0b1f1a]"
          />

          {/* ROLE */}
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-[#0b1f1a] text-white"
          >
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold disabled:opacity-60"
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
