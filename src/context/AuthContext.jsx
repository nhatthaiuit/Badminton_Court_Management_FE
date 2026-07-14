/**
 * @file src/context/AuthContext.jsx
 * @description Context provider for authentication state.
 *              Manages the current logged-in user and token.
 */

import { createContext, useState, useEffect } from "react";
import { authApi } from "../api/authApi";
import toast from "react-hot-toast";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on initial load
    const loadUser = async () => {
      const token = localStorage.getItem("bcms_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.getProfile();
        setUser(response.data.data);
      } catch (error) {
        console.error("Failed to load user profile", error);
        localStorage.removeItem("bcms_token");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (phone, password) => {
    try {
      const response = await authApi.login({ phone, password });
      const { user, token } = response.data.data;
      
      localStorage.setItem("bcms_token", token);
      setUser(user);
      toast.success("Logged in successfully!");
      return user; // Return user object for role-based redirect
    } catch (error) {
      const data = error.response?.data;
      if (data?.errors && data.errors.length > 0) {
        toast.error(data.errors[0].msg);
      } else {
        toast.error(data?.message || "Login failed");
      }
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem("bcms_token");
    setUser(null);
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
