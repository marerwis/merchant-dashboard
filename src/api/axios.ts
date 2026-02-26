import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// 🔐 إضافة التوكن تلقائيًا
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🚨 التعامل مع 401 (Token Expired / Invalid)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // حذف التوكن
      localStorage.removeItem("token");

      // إعادة التوجيه لصفحة Login
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;
