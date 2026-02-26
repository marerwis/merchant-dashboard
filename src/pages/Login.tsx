import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Wallet, LogIn, Sparkles } from "lucide-react";

type Props = {
  setIsAuth: (value: boolean) => void;
};

export default function Login({ setIsAuth }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post("/login", { email, password });
      localStorage.setItem("token", res.data.data.token);
      setIsAuth(true);
      navigate("/dashboard");
    } catch {
      alert("Invalid credentials. If backend is not running, use Demo Mode.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = () => {
    localStorage.setItem("token", "demo-token-12345");
    localStorage.setItem("environment", "sandbox");
    setIsAuth(true);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4">
            <Wallet className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Merchant Hub</h2>
          <p className="text-sm text-muted-foreground mt-1">Sign in to manage your payments</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Email Address</label>
            <input
              type="email"
              placeholder="merchant@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none text-foreground"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none text-foreground"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground font-bold rounded-lg py-2.5 flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border">
          <button
            onClick={handleDemo}
            className="w-full bg-slate-100 dark:bg-slate-800 text-foreground font-bold rounded-lg py-2.5 flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-border"
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
            View Stitch UI Demo
          </button>
          <p className="text-xs text-center text-muted-foreground mt-3">
            Click here to bypass local backend login and instantly preview the new UI.
          </p>
        </div>
      </div>
    </div>
  );
}
