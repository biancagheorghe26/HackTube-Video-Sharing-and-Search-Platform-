import React from "react";
import { useNavigate } from "react-router-dom";

export function LoginButton() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <button
      onClick={handleLoginClick}
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      Login
    </button>
  );
}
