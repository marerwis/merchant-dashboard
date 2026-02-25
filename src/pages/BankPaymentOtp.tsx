import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Smartphone, CheckCircle2, Lock, ArrowLeft } from "lucide-react";
// In a real scenario, this would import the full payload builder
// import api from "../api/axios";

export default function BankPaymentOtp() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [info, setInfo] = useState<{ phone: string; amount: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem("bank_payment");
    if (!data) {
      navigate("/dashboard/bank-payment");
      return;
    }
    setInfo(JSON.parse(data));
  }, [navigate]);

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      alert("Invalid OTP format. Must be at least 4 digits.");
      return;
    }

    setLoading(true);

    // MOCK API CALL - Replace with actual /api/pay call
    // The environment header should dictate if it auto-succeeds
    try {
      /*
      await api.post("/pay", {
         phone: info?.phone,
         amount: info?.amount,
         otp: otp
      });
      */

      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSuccess(true);
      sessionStorage.removeItem("bank_payment");

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (e) {
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!info) return null;

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 animate-in zoom-in duration-500">
        <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Payment Successful</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          The transaction was completed successfully. Redirecting you back to the dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-md mx-auto mt-10">
      <div className="text-center space-y-2">
        <button
          onClick={() => navigate("/dashboard/bank-payment")}
          className="absolute left-8 top-24 sm:static p-2 -ml-2 rounded-md hover:bg-muted text-muted-foreground transition-colors inline-block"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Smartphone className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Confirm Transaction
        </h2>
        <p className="text-muted-foreground text-sm">
          A verification code has been sent to your phone.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-lg p-6 sm:p-8">
        <div className="bg-muted/30 rounded-lg p-4 mb-6 border border-border space-y-2 text-center flex flex-col items-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Paying via Bank Transfer</span>
          <div className="text-2xl font-bold text-foreground">LYD {parseFloat(info.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="text-sm text-muted-foreground">{info.phone}</div>
        </div>

        <form onSubmit={confirm} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="otp" className="text-sm font-medium leading-none text-foreground flex justify-center">
              Enter SMS Code
            </label>
            <div className="relative flex justify-center mt-2">
              <div className="flex justify-center w-full">
                <input
                  id="otp"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="flex h-14 w-full sm:w-2/3 text-center text-3xl tracking-[0.5em] rounded-md border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all font-mono"
                  required
                  autoComplete="one-time-code"
                />
              </div>
              <div className="pointer-events-none absolute inset-y-0 right-0 sm:right-12 flex items-center pr-3">
                <Lock className="h-4 w-4 text-muted-foreground/50" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 4}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary h-11 px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 mt-4"
          >
            {loading ? (
              <>Verifying<span className="animate-pulse">...</span></>
            ) : (
              "Confirm Payment"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
