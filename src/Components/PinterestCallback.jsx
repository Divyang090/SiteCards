import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../Configuration/Config";

export default function PinterestCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    console.log("Received code:", code);
    console.log("Received state:", state);

    if (!code || !state) return;

    fetch(`${BASE_URL}/callback?code=` + code + "&state=" + state, {
      method: "GET",
      credentials: "include"
    })
      .then(() => {
        navigate("/pinterest/success");
      })
      .catch(err => console.error("Callback error:", err));
  }, []);

  return <div>Processing Pinterest login…</div>;
}