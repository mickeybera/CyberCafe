import axios from "axios";

const api = axios.create({
  baseURL: "https://cyber-cafe-t3zt.vercel.app/api",
  //  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});


// ==========================================
// ADD TOKEN TO REQUEST
// ==========================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export default api;