import React, { useState } from "react";

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
      const res = await fetch("http://localhost:5000/api/auth/me", {
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
      const res = await fetch("http://localhost:5000/api/auth/refresh", {
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
      <h2>🔧 Auth Debug Panel</h2>

      <button onClick={showTokens}>Show Tokens</button>
      <button onClick={testAccess} style={{ marginLeft: 10 }}>Test Access</button>
      <button onClick={testRefresh} style={{ marginLeft: 10 }}>Test Refresh</button>

      <br /><br />

      <button onClick={breakAccess}>Corrupt Access Token</button>
      <button onClick={removeAccess} style={{ marginLeft: 10 }}>
        Remove Access Token
      </button>

      <br /><br />

      <button onClick={clearAll} style={{ background: "red", color: "white" }}>
        Clear All Tokens
      </button>

      <pre
        style={{
          marginTop: "20px",
          padding: "10px",
          background: "#111",
          color: "#0f0",
          height: "300px",
          overflow: "auto",
          whiteSpace: "pre-wrap",
        }}
      >
        {output}
      </pre>
    </div>
  );
}