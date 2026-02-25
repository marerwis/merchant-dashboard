import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Login from "./pages/Login";
import DashboardLayout from "./layout/DashboardLayout";

export default function App() {
  const [isAuth, setIsAuth] = useState<boolean>(
    !!localStorage.getItem("token")
  );

  // 🔄 مزامنة حالة التوكن
  useEffect(() => {
    const syncAuth = () => {
      setIsAuth(!!localStorage.getItem("token"));
    };

    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* 🔐 Login */}
        <Route
          path="/"
          element={
            isAuth ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login setIsAuth={setIsAuth} />
            )
          }
        />

        {/* 📊 Dashboard (كل الصفحات الداخلية هنا) */}
        <Route
          path="/dashboard/*"
          element={
            isAuth ? (
              <DashboardLayout />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* 🛑 أي مسار غير معروف */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
