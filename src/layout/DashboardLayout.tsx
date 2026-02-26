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
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-background/80 px-6 lg:px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight">Merchant Hub</h1>
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${environment === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-orange-500'}`}></span>
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${environment === 'live' ? 'text-emerald-500' : 'text-orange-500'}`}>
                  {environment} Mode
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Environment Switcher */}
            <div className="flex items-center rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-1">
              <button
                onClick={() => setEnvironment("sandbox")}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-bold transition-all",
                  environment === "sandbox" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-slate-500 dark:text-slate-400 hover:text-foreground"
                )}
              >
                Sandbox
              </button>
              <button
                onClick={() => setEnvironment("live")}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-bold transition-all",
                  environment === "live" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-slate-500 dark:text-slate-400 hover:text-foreground"
                )}
              >
                Live
              </button>
            </div>

            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              <ShieldAlert className="h-5 w-5" />
            </button>
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
