// client/src/api/axios.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
});

API.interceptors.request.use(
  (config) => {
    try {
      let token = localStorage.getItem("token");

      // Fallback 1: Zustand persistent storage key
      if (!token) {
        const authStorage = localStorage.getItem("auth-storage");
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          token = parsed.state?.token || parsed.token;
        }
      }

      // Fallback 2: Standalone user JSON key
      if (!token) {
        const userStorage = localStorage.getItem("user");
        if (userStorage) {
          const parsed = JSON.parse(userStorage);
          token = parsed.token;
        }
      }

      if (token && token !== "undefined" && token !== "null") {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn("[AXIOS] No valid Auth token found in LocalStorage.");
      }
    } catch (err) {
      console.error("[AXIOS INTERCEPTOR ERROR]:", err);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default API;
