import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Phone, Coins, ArrowRight } from "lucide-react";

export default function BankPayment() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !amount) {
      alert("Please enter both phone number and amount.");
      return;
    }

    // Pass data via state or session storage for the OTP screen
    sessionStorage.setItem("bank_payment", JSON.stringify({ phone, amount }));
    navigate("/dashboard/bank-payment/otp");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-xl mx-auto mt-10">
      <div className="text-center space-y-2">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Building2 className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Bank Payment Simulator
        </h2>
        <p className="text-muted-foreground text-sm">
          Test the payment flow using the Gateway API. Enter a phone number and amount to initiate.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-lg p-6 sm:p-8">
        <form onSubmit={submit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground">
              Bank Account Phone Number
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 09xxxxxxxx"
                className="flex h-10 w-full rounded-md border border-input bg-background pl-10 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground">
              Amount (LYD)
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Coins className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0.1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="flex h-10 w-full rounded-md border border-input bg-background pl-10 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary h-11 px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            Continue to OTP
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
