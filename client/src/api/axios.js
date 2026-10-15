// client/src/api/axios.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001/api",
});

// Automatically attach JWT authorization token to every request if available
API.interceptors.request.use((req) => {
  const user = JSON.parse(localStorage.getItem("userInfo"));
  if (user && user.token) {
    req.headers.Authorization = `Bearer ${user.token}`;
  }
  return req;
});

export default API;
