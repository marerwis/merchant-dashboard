import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

type Props = {
  setIsAuth: (value: boolean) => void;
};

export default function Login({ setIsAuth }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post("/login", { email, password });

      localStorage.setItem("token", res.data.data.token);

      // ✅ نحدّث الحالة
      setIsAuth(true);

      // ✅ ننتقل فورًا
      navigate("/dashboard");
    } catch {
      alert("فشل تسجيل الدخول");
    }
  };

  return (
    <div className="card">
      <h2>Merchant Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
