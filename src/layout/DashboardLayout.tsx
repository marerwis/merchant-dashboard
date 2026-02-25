import { useEffect, useState } from "react";
import { useNavigate, Routes, Route, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ReceiptText, KeyRound, Webhook, LogOut, Wallet, ShieldAlert } from "lucide-react";
import api from "../api/axios";

import Dashboard from "../pages/Dashboard";
import Transactions from "../pages/Transactions";
import ApiKeys from "../pages/ApiKeys";
import Webhooks from "../pages/Webhooks";
import WebhookLogs from "../pages/WebhookLogs";
import BankPayment from "../pages/BankPayment";
import BankPaymentOtp from "../pages/BankPaymentOtp";
import AdminSettlements from "../pages/AdminSettlements";
import MerchantSettlements from "../pages/MerchantSettlements";

import { cn } from "../utils/utils";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [environment, setEnvironment] = useState<"sandbox" | "live">(
    (localStorage.getItem("environment") as "sandbox" | "live") || "sandbox"
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem("environment", environment);
    // Refresh page data or set global api header
    api.defaults.headers.common["X-Environment"] = environment;
  }, [environment]);

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (e) {
      console.error("Logout API failed");
    } finally {
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  const navItems = [
    { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
    { name: "Transactions", path: "/dashboard/transactions", icon: ReceiptText },
    { name: "Payouts", path: "/dashboard/payouts", icon: Wallet },
    { name: "API Keys", path: "/dashboard/api", icon: KeyRound },
    { name: "Webhooks", path: "/dashboard/webhooks", icon: Webhook },
    { name: "Bank Payment", path: "/dashboard/bank-payment", icon: Wallet },
    { name: "Admin Portal", path: "/dashboard/admin", icon: ShieldAlert },
  ];

  return (
    <div className="flex h-screen w-full bg-background dark text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col justify-between hidden md:flex">
        <div>
          <div className="p-6">
            <h2 className="text-2xl font-bold tracking-tight text-primary">Gateway</h2>
          </div>
          <nav className="space-y-1 px-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted/50 hover:text-foreground",
                    isActive ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-border">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6 lg:px-8">
          <h1 className="text-xl font-semibold">Merchant Portal</h1>

          <div className="flex items-center gap-4">
            {/* Environment Switcher */}
            <div className="flex items-center rounded-full border border-border bg-muted/50 p-1">
              <button
                onClick={() => setEnvironment("sandbox")}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all",
                  environment === "sandbox" ? "bg-background text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Sandbox
              </button>
              <button
                onClick={() => setEnvironment("live")}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all",
                  environment === "live" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Live
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 lg:p-8 bg-background">
          <div className="mx-auto max-w-6xl">
            <Routes>
              <Route path="/" element={<Dashboard environment={environment} />} />
              <Route path="transactions" element={<Transactions environment={environment} />} />
              <Route path="api" element={<ApiKeys environment={environment} />} />
              <Route path="webhooks" element={<Webhooks environment={environment} />} />
              <Route path="webhook-logs" element={<WebhookLogs environment={environment} />} />
              <Route path="payouts" element={<MerchantSettlements environment={environment} />} />

              <Route path="bank-payment" element={<BankPayment />} />
              <Route path="bank-payment/otp" element={<BankPaymentOtp />} />

              {/* Admin Portal */}
              <Route path="admin" element={<AdminSettlements />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}
