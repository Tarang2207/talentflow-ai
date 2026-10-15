// client/src/store/useAuthStore.js
import { create } from "zustand";
import API from "../api/axios";

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("userInfo")) || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await API.post("/auth/login", { email, password });
      localStorage.setItem("userInfo", JSON.stringify(data));
      set({ user: data, loading: false });
      return data;
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  register: async (name, email, password, role) => {
    set({ loading: true, error: null });
    try {
      const { data } = await API.post("/auth/register", {
        name,
        email,
        password,
        role,
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      set({ user: data, loading: false });
      return data;
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  logout: () => {
    localStorage.removeItem("userInfo");
    set({ user: null });
  },
}));
