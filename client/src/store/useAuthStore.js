// client/src/store/useAuthStore.js
import { create } from "zustand";
import API from "../api/axios";

export const useAuthStore = create((set) => ({
  user: (() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await API.post("/auth/login", { email, password });
      const userObj = data.user || data;
      const tokenStr = data.token;

      if (tokenStr) {
        localStorage.setItem("token", tokenStr);
      }
      if (userObj) {
        localStorage.setItem("user", JSON.stringify(userObj));
      }

      set({ user: userObj, token: tokenStr, loading: false });
      return { success: true, user: userObj };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await API.post("/auth/register", userData);
      const userObj = data.user || data;
      const tokenStr = data.token;

      if (tokenStr) {
        localStorage.setItem("token", tokenStr);
      }
      if (userObj) {
        localStorage.setItem("user", JSON.stringify(userObj));
      }

      set({ user: userObj, token: tokenStr, loading: false });
      return { success: true, user: userObj };
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("auth-storage");
    set({ user: null, token: null, error: null });
  },
}));
