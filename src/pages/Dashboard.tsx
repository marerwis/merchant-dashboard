import { useEffect, useState } from "react";
import api from "../api/axios";

type Overview = {
  total_amount: number;
  total_transactions: number;
  success: number;
  pending: number;
  failed: number;
};

type Transaction = {
  id: number;
  phone: string;
  amount: string;
  status: "success" | "pending" | "failed";
  reference: string;
  created_at: string;
};

export default function Dashboard({ environment }: { environment: "sandbox" | "live" }) {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // Reset Data on env change
    setOverview(null);
    setTransactions([]);

    api.get("/dashboard/overview").then((res) => {
      setOverview(res.data.data);
    });

    api.get("/dashboard/transactions").then((res) => {
      setTransactions(res.data.data.data);
    });
  }, [environment]);

  const statusClass = (status: string) => {
    if (status === "success") return "bg-emerald-500/15 text-emerald-500 border border-emerald-500/20";
    if (status === "pending") return "bg-orange-500/15 text-orange-500 border border-orange-500/20";
    return "bg-rose-500/15 text-rose-500 border border-rose-500/20";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Overview</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Here's what's happening in your <span className="font-semibold text-primary uppercase">{environment}</span> store today.
        </p>
      </div>

      {/* Loading State */}
      {!overview ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 animate-pulse">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-32 bg-muted/50 rounded-xl border border-border"></div>
          ))}
        </div>
      ) : (
        /* ===== Cards ===== */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Card 1 */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Total Revenue</h3>
              <span className="text-emerald-500 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-xl">💰</span>
            </div>
            <div className="text-3xl font-bold text-foreground mt-2">LYD {new Intl.NumberFormat().format(overview.total_amount)}</div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Transactions</h3>
              <span className="text-primary flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xl">📊</span>
            </div>
            <div className="text-3xl font-bold text-foreground mt-2">{overview.total_transactions}</div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Success</h3>
              <span className="text-emerald-500 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-xl">✅</span>
            </div>
            <div className="text-3xl font-bold text-emerald-500 mt-2">{overview.success}</div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Pending</h3>
              <span className="text-orange-500 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/10 text-xl">⏳</span>
            </div>
            <div className="text-3xl font-bold text-orange-500 mt-2">{overview.pending}</div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Failed</h3>
              <span className="text-rose-500 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/10 text-xl">❌</span>
            </div>
            <div className="text-3xl font-bold text-rose-500 mt-2">{overview.failed}</div>
          </div>
        </div>
      )}

      {/* ===== Transactions ===== */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground tracking-tight">Recent Transactions</h3>

        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b border-border bg-muted/40">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[80px]">ID</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Phone</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Reference</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No recent transactions in {environment}.
                    </td>
                  </tr>
                ) : (
                  transactions.slice(0, 5).map((tx) => (
                    <tr key={tx.id} className="border-b border-border transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle font-medium text-foreground">#{tx.id}</td>
                      <td className="p-4 align-middle text-muted-foreground">{tx.phone}</td>
                      <td className="p-4 align-middle font-semibold text-foreground">LYD {tx.amount}</td>
                      <td className="p-4 align-middle">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass(tx.status)}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-muted-foreground font-mono text-xs">{tx.reference}</td>
                      <td className="p-4 align-middle text-muted-foreground">{new Date(tx.created_at).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
