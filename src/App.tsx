import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./api/AuthContext";

import Login from "./pages/Login";
import DashboardLayout from "./layout/DashboardLayout";

export default function App() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isAuth = !!session;

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
              // Temporarily pass a no-op function to setIsAuth until Login is refactored 
              // to use Supabase signIn natively.
              <Login _setIsAuth={() => { }} />
            )
          }
        />

        {/* 📊 Dashboard */}
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

        {/* 🛑 Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
