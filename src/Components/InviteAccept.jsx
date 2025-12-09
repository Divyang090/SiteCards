import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../Configuration/Config";
import { useAuth } from "./AuthContext";

const InviteAccept = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [validToken, setValidToken] = useState(false);

  const [userData, setUserData] = useState({ email: "", password: "" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { authFetch } = useAuth();

  // Validate invite token (POST + JWT)
  useEffect(() => {
    if (!token) {
      setError("Missing invite token.");
      setValidating(false);
      return;
    }

    const validate = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");

        const res = await axios.post(
          `${BASE_URL}/invite/invite/validate`,
          { token },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );

        // backend returns: message, email, company_id
        setUserData((prev) => ({
          ...prev,
          email: res.data.email
        }));

        setValidToken(true);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to validate invite link.");
      }

      setValidating(false);
    };

    validate();
  }, [token]);

  // Submit registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (userData.password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${BASE_URL}/invite/invite/register`, {
        token,
        name: userData.name,
        password: userData.password
      });

      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to complete registration.");
    }

    setLoading(false);
  };


  // UI states
  if (validating) return <p>Validating invite link…</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!validToken) return <p>Invalid invite link.</p>;
  if (submitted) return <p className="text-green-500">Invite accepted! You can now login.</p>;

  return (
    <div className="min-h-screen flex items-center justify-center theme-bg-primary p-4">
      <form
        onSubmit={handleSubmit}
        className="theme-bg-card shadow-xl rounded-lg p-6 w-full max-w-md space-y-4"
      >
        <h2 className="text-xl font-semibold theme-text-primary">Accept Invite</h2>

        {/* <div>
          <label className="block mb-1 text-sm font-medium">Email</label>
          <input
            type="text"
            value={userData.email}
            disabled
            className="w-full border rounded-lg px-3 py-2 bg-gray-100"
          />
        </div> */}

        {/* Name */}
        <div>
          <label className="theme-text-secondary block mb-1 text-sm font-medium">Name</label>
          <input
            type="text"
            value={userData.name}
            onChange={(e) =>
              setUserData({ ...userData, name: e.target.value })
            }
            required
            className="w-full border border-gray-500 hover:border-blue-600 rounded-lg px-3 py-2"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block mb-1 text-sm font-medium theme-text-secondary">Password</label>
          <input
            type="password"
            value={userData.password}
            onChange={(e) =>
              setUserData({ ...userData, password: e.target.value })
            }
            required
            className="w-full border border-gray-500 rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium theme-text-secondary">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full border border-gray-500 rounded-lg px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-lg text-white ${loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default InviteAccept;