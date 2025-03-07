import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", username.trim());
    formData.append("password", password.trim());
    if (avatar) {
      formData.append("avatar", avatar);
    }

    try {
      const response = await fetch("http://localhost:3002/users", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Eroare server: ${response.status} - ${errorText}`);
      }

      const userData = await response.json();
      console.log("Înregistrare reușită:", userData);

      setMessage("Înregistrare reușită!");
      setIsSuccess(true);

      // Redirecționează utilizatorul după 2 secunde
      setTimeout(() => navigate("/login"), 2000); // Navighează la pagina de login
    } catch (error) {
      console.error("Eroare la înregistrare:", error);
      setMessage("Înregistrare eșuată. Verifică datele introduse.");
      setIsSuccess(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      // Validare: tipul fișierului și dimensiunea
      if (!file.type.startsWith("image/")) {
        setMessage("Te rugăm să selectezi un fișier de tip imagine.");
        setAvatar(null);
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setMessage("Fișierul trebuie să aibă maxim 2MB.");
        setAvatar(null);
        return;
      }
      setAvatar(file);
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="avatar"
              className="block text-sm font-medium text-gray-700"
            >
              Avatar
            </label>
            <input
              type="file"
              id="avatar"
              accept="image/*"
              onChange={handleAvatarChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Register
          </button>
          {message && (
            <p
              className={`text-sm text-center mt-2 ${
                isSuccess ? "text-green-500" : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
