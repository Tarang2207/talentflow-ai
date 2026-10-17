// client/src/api/axios.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
});

API.interceptors.request.use(
  (config) => {
    try {
      const authStorage = localStorage.getItem("auth-storage");
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        const token = parsed.state?.token;

        if (token && token !== "null" && token !== "undefined") {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (err) {
      console.error("Error reading auth token:", err);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default API;
