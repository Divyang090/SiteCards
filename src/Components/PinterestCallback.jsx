import { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // for redirect after success

export default function PinterestCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const stateEncoded = url.searchParams.get("state");

    if (!stateEncoded) return;

    const { oauthState, jwt } = JSON.parse(atob(stateEncoded));

    console.log("Received code:", code);
    console.log("JWT from state:", jwt);

    fetch("http://localhost:5000/api/pinterest/pinterest/callback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwt}` // use the JWT from state
      },
      body: JSON.stringify({ code, state: oauthState })
    })
      .then(res => res.json())
      .then(data => {
        console.log("Backend callback response:", data);
      })
      .catch(err => console.error("Callback error:", err));
  }, []);

  return (
    <div>
      Processing Pinterest login…
    </div>
  );
}