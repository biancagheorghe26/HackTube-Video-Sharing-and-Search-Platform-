import React, { createContext, useContext, useState, ReactNode } from "react";

interface User {
  name: string;
  profileImage: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const login = (user: User) => {
    setIsAuthenticated(true);
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user)); // Save user in localStorage
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null); // Clear user details
    localStorage.removeItem("user"); // Remove user from localStorage
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};
