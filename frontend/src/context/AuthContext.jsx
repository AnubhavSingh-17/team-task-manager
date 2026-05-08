import React, { createContext, useState, useContext, useEffect } from "react";
import { axiosInstance } from "../config/axios";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (_) {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post("/auth/login", { email, password });
      const userData = response.data.data.user;
      // Always clear old user first, then set new one
      localStorage.removeItem("user");
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      toast.success(`Welcome back, ${userData.name}!`);
      return true;
    } catch (error) {
      if (!error.response) {
        toast.error("Cannot connect to server. Is the backend running?");
      } else {
        toast.error(error.response?.data?.message || "Login failed");
      }
      return false;
    }
  };

  const register = async (name, email, password, role) => {
    try {
      await axiosInstance.post("/auth/register", { name, email, password, role });
      toast.success("Account created! Please sign in.");
      return true;
    } catch (error) {
      if (!error.response) {
        toast.error("Cannot connect to server. Is the backend running?");
      } else {
        toast.error(error.response?.data?.message || "Registration failed");
      }
      return false;
    }
  };

  const logout = () => {
    // 1. Clear local state IMMEDIATELY — don't wait for API
    setUser(null);
    localStorage.removeItem("user");

    // 2. Tell the backend to clear the cookie (fire-and-forget)
    axiosInstance.post("/auth/logout").catch(() => { });

    // 3. Hard redirect — guarantees a clean React tree, no stale state
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
