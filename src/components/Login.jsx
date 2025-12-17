import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { BASE_URL } from "../utils/constant";

const Login = () => {
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        BASE_URL + "/login",
        { emailId, password },
        { withCredentials: true }
      );

      dispatch(addUser(res.data));

      if (res.data.role === "student") {
        navigate("/feed");
      } else if (res.data.role === "mentor") {
        navigate("/mentor/dashboard");
      }
    } catch (err) {
      if (err.response) {
        setError("Invalid Credentials");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-[#eefaf5]">
      <div className="w-full max-w-md bg-[#0f2f26] rounded-2xl p-8 shadow-xl text-white">
        <h2 className="text-3xl font-semibold text-center mb-2">
          Welcome back
        </h2>

        <p className="text-center text-gray-400 mb-4">
          Login to continue your MentorX journey
        </p>

        {/* ✅ ERROR MESSAGE */}
        {error && (
          <p className="text-red-400 text-sm text-center mb-4">{error}</p>
        )}

        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm mb-1 text-gray-300">Email</label>
            <input
              type="email"
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#0b1f1a]"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#0b1f1a]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold"
          >
            Login
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-emerald-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
