import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { BASE_URL } from "../Configuration/Config";

const InviteAccept = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);

  const [validToken, setValidToken] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [userData, setUserData] = useState({
    email: "",
    name: "",
    password: "",
    company_id: "",
    role_name: "",
  });

  // ---------------------------------------------------
  // VALIDATE TOKEN (NO JWT REQUIRED)
  // ---------------------------------------------------
  useEffect(() => {
    if (!token) {
      setError("Missing invite token.");
      setValidating(false);
      return;
    }

    const validate = async () => {
      try {
        const res = await axios.post(`${BASE_URL}/invite/invite/validate_with_role`, {
          token,
        });

        setUserData((prev) => ({
          ...prev,
          email: res.data.email,
          company_id: res.data.company_id,
          role_name: res.data.role_name,
        }));

        setValidToken(true);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to validate invite link.");
      }

      setValidating(false);
    };

    validate();
  }, [token]);

  // ---------------------------------------------------
  // SUBMIT REGISTRATION
  // ---------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (userData.password !== confirmPassword) {
      setError("Passwords do match.");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${BASE_URL}/invite/invite/register_with_role`, {
        token,
        name: userData.name,
        password: userData.password,
      });

      setSubmitted(true);

      // CONFETTI BLAST 🎉🎉🎉
      confetti({
        particleCount: 300,
        spread: 90,
        origin: { y: 0.6 }
      });

      // AUTO-REDIRECT TO DASHBOARD AFTER 5 SECONDS
      setTimeout(() => navigate("/"), 5000);

    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to complete registration."
      );
    }

    setLoading(false);
  };

  // ---------------------------------------------------
  // UI STATES
  // ---------------------------------------------------
  if (validating)
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-medium">
        Validating invite link…
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );

  if (!validToken)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 font-semibold">Invalid invite link.</p>
      </div>
    );

  // ---------------------------------------------------
  // SUCCESS SCREEN
  // ---------------------------------------------------
  if (submitted)
    return (
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120 }}
          className="bg-white/70 backdrop-blur-lg shadow-2xl border border-white/50 p-8 rounded-xl text-center"
        >
          <h1 className="text-3xl font-bold text-green-700 mb-4">
            🎉 Account Created!
          </h1>
          <p className="text-gray-700 text-lg mb-4">
            Redirecting to dashboard in <b>5 seconds…</b>
          </p>

          <button
            onClick={() => navigate("/")}
            className="mt-3 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md"
          >
            Go to Dashboard Now →
          </button>
        </motion.div>
      </motion.div>
    );

  // ---------------------------------------------------
  // MAIN FORM (with CARD SLIDE-IN)
  // ---------------------------------------------------
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-100 to-gray-300">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 90 }}
        className="backdrop-blur-lg bg-white/60 shadow-2xl rounded-xl p-8 w-full max-w-md space-y-5 border border-white/40"
      >
        <h2 className="text-2xl font-bold text-gray-800 text-center">
          Accept Invitation
        </h2>

        <div className="bg-gray-50 p-3 rounded-lg border">
          <p className="text-sm text-gray-600">
            <strong>Email:</strong> {userData.email}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Role:</strong> {userData.role_name || "N/A"}
          </p>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            value={userData.name}
            onChange={(e) =>
              setUserData({ ...userData, name: e.target.value })
            }
            required
            placeholder="Enter your full name"
            className="w-full border rounded-lg px-3 py-2 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            value={userData.password}
            onChange={(e) =>
              setUserData({ ...userData, password: e.target.value })
            }
            required
            placeholder="Enter password"
            className="w-full border rounded-lg px-3 py-2 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Confirm password"
            className="w-full border rounded-lg px-3 py-2 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-lg text-white font-semibold transition ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Creating Account…" : "Create Account"}
        </button>
      </motion.form>
    </div>
  );
};

export default InviteAccept;