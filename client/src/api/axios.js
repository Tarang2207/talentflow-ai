// client/src/api/axios.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001/api",
});

// Interceptor to attach JWT token to every outgoing request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default API;
