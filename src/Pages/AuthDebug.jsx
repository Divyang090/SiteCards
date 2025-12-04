import React, { useState } from "react";
import { BASE_URL } from "../Configuration/Config";

export default function AuthDebug() {
  const [output, setOutput] = useState("");

  const log = (msg) => setOutput((prev) => prev + msg + "\n");

  const getTokens = () => {
    return {
      access: localStorage.getItem("accessToken"),
      refresh: localStorage.getItem("refreshToken"),
    };
  };

  const decode = (token) => {
    try {
      if (!token) return "❌ No token";
      const parts = token.split(".");
      if (parts.length !== 3) return "❌ Not a JWT";
      return JSON.stringify(JSON.parse(atob(parts[1])), null, 2);
    } catch (e) {
      return "❌ Decode failed: " + e.message;
    }
  };

  const testAccess = async () => {
    const { access } = getTokens();
    log("🔍 Testing access token…");

    try {
      const res = await fetch(`${BASE_URL}/auth/user/protected`, {
        headers: {
          Authorization: "Bearer " + access,
        },
      });

      log("Status: " + res.status);
      log(await res.text());
    } catch (err) {
      log("❌ Error: " + err.message);
    }
  };

  const testRefresh = async () => {
    const { refresh } = getTokens();
    log("🔄 Testing refresh token…");

    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + refresh,
        },
      });

      log("Status: " + res.status);
      log(await res.text());
    } catch (err) {
      log("❌ Error: " + err.message);
    }
  };

  const breakAccess = () => {
    localStorage.setItem("accessToken", "broken.token.here");
    log("💥 Access token corrupted");
  };

  const removeAccess = () => {
    localStorage.removeItem("accessToken");
    log("🚫 Access token removed (refresh should kick in)");
  };

  const clearAll = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    log("🧹 Cleared all tokens");
  };

  const showTokens = () => {
    const { access, refresh } = getTokens();
    log("📦 Access Token:\n" + access);
    log("📦 Refresh Token:\n" + refresh);
    log("\n🧬 Decoded Access:\n" + decode(access));
    log("\n🧬 Decoded Refresh:\n" + decode(refresh));
  };

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h2 className="bg-violet-100 rounded-2xl flex justify-center mb-4 text-2xl">🔧 Auth Debug Panel</h2>

      <button className="bg-blue-300 rounded-2xl p-1" onClick={showTokens}>Show Tokens</button>
      <button className="bg-green-300 rounded-2xl p-1" onClick={testAccess} style={{ marginLeft: 10 }}>Test Access</button>
      <button className="bg-red-300 rounded-2xl p-1" onClick={testRefresh} style={{ marginLeft: 10 }}>Test Refresh</button>

      <br /><br />

      <button className="bg-yellow-300 rounded-2xl p-1" onClick={breakAccess}>Corrupt Access Token</button>
      <button className="bg-purple-300 rounded-2xl p-1" onClick={removeAccess} style={{ marginLeft: 10 }}>
        Remove Access Token
      </button>

      <br /><br />

      <button onClick={clearAll} style={{ background: "red", color: "white" }}>
        Clear All Tokens
      </button>

      <pre className="scrollbar-hidden"
        style={{
          marginTop: "20px",
          padding: "10px",
          background: "#111",
          color: "#0f0",
          height: "70vh",
          overflow: "auto",
          whiteSpace: "pre-wrap",
        }}
      >
        {output}
      </pre>
    </div>
  );
}