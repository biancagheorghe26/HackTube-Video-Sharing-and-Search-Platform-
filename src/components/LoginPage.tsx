import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // Importă contextul

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); // Accesează funcția de login din context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name: username.trim(),
      password: password.trim(),
    };

    try {
      const response = await fetch("http://localhost:3002/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username, // sau email
          password: password,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Eroare server: ${response.status} - ${errorText}`);
      }

      const userData = await response.json();

      // Assuming the userData contains the necessary info
      login({
        name: userData.username, // Assuming userData contains username
        profileImage: userData.profileImage || "defaultProfileImage.png", // Fallback profile image
      });

      setMessage("Autentificare reușită!");
      setTimeout(() => {
        navigate("/"); // Redirect to profile page after successful login
      }, 2000);
    } catch (error) {
      console.error("Eroare la autentificare:", error);
      setMessage("Eroare la autentificare!");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Login</button>
        {message && <p>{message}</p>}
      </form>

      {/* Butonul Register */}
      <div className="mt-4">
        <button
          onClick={() => navigate("/register")}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Register
        </button>
      </div>
    </div>
  );
}
