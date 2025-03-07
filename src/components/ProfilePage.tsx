import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext"; // Importă contextul de autentificare

export function ProfilePage() {
  const { isAuthenticated, user } = useAuth(); // Obține datele utilizatorului din context
  const [name, setName] = useState(user?.name || ""); // Setează numele utilizatorului
  const [password, setPassword] = useState(""); // Setează parola
  const [image, setImage] = useState<string | File>(user?.profileImage || ""); // Setează poza de profil

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("password", password);
    
    if (image) {
      const file = image instanceof File ? image : null;
      if (file) {
        formData.append("avatar", file); // Adaugă imaginea ca fișier
      }
    }

    try {
      const response = await fetch("http://localhost:3002/profile", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`, 
          credentials: 'include',// Dacă folosești token de autentificare
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Eroare server: ${response.status} - ${errorText}`);
      }

      const updatedUser = await response.json();
      console.log("Profil actualizat:", updatedUser);
      alert("Modificările au fost salvate cu succes!");
    } catch (error) {
      console.error("Eroare la salvarea profilului:", error);
      alert("Eroare la salvarea profilului!");
    }
  };

  return (
    <div className="p-4">
      <h2>Editare Profil</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="name">Nume:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2"
          />
        </div>
        <div>
          <label htmlFor="password">Parolă:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2"
          />
        </div>
        <div>
          <label htmlFor="image">Poză de profil:</label>
          <input
            type="file"
            id="image"
            onChange={(e) => setImage(e.target.files![0])} // Setează fișierul selectat
            className="border p-2"
          />
          {image && image instanceof File && <img src={URL.createObjectURL(image)} alt="Profil" className="w-32 h-32 mt-2" />}
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="mt-4 bg-blue-500 text-white p-2 rounded"
        >
          Salvează modificările
        </button>
      </form>
    </div>
  );
}
