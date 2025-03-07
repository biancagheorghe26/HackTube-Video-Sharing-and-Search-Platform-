import { useState } from "react";
import { User } from "lucide-react";
import { Link } from "react-router-dom"; // Dacă folosești React Router
import React from "react";

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="relative">
      <button onClick={toggleDropdown} className="flex items-center space-x-2">
        <User className="w-6 h-6" />
        <span>Login</span> {/* Aici poți înlocui cu numele utilizatorului dacă este logat */}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg">
          <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-200">
            Vezi Profil
          </Link>
        </div>
      )}
    </div>
  );
}
