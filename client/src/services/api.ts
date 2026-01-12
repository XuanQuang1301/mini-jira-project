import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Tự động gắn Token vào header nếu có trong localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;