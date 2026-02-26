import { useState } from "react";
import { Mail, Lock, ArrowRight, Loader2, CreditCard } from "lucide-react";
import { supabase } from "../api/supabase";

export default function Login({ _setIsAuth }: { _setIsAuth?: (auth: boolean) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Still keeping the prop for backward compatibility matching App.tsx signature until we completely drop standard state
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError("");
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError; // Caught below
      }

      // The AuthContext event listener will automatically catch the session and redirect
      // We do not need to redirect manually here.
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadDemoUser = () => {
    setEmail("demo@gateway.ly");
    setPassword("demo123");
  };

  return (
    <div className="flex min-h-screen items-center justify-center relative overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[100px]" />
      </div>

      <div className="w-full max-w-md p-8 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6 shadow-sm border border-primary/20">
            <CreditCard className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">Merchant Portal</h1>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Manage your payments, analyze revenue, and scale your business.
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-card/50 backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

          <form onSubmit={handleLogin} className="space-y-5 relative">
            {error && (
              <div className="p-3 text-sm font-medium text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-lg animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground ml-1">Email <span className="text-primary">*</span></label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 bg-background/50 border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground ml-1">Password <span className="text-primary">*</span></label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-background/50 border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/25 disabled:opacity-70 group"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Test Notice */}
          <div className="mt-8 text-center border-t border-border/50 pt-6">
            <p className="text-xs text-muted-foreground mb-3">View the demo UI instantly</p>
            <button
              onClick={loadDemoUser}
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors border border-primary/20 rounded-full px-4 py-1.5 hover:bg-primary/5"
            >
              Load Demo Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
