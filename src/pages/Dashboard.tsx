import { useEffect, useState } from "react";
import api from "../api/axios";
import { Wallet, TrendingUp, Search, CheckCircle2, Clock, XCircle } from "lucide-react";

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

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      <div className="flex items-center justify-between mt-2">
        <h2 className="text-2xl font-extrabold tracking-tight">Overview & Metrics</h2>
      </div>

      {/* Loading State */}
      {!overview ? (
        <div className="grid grid-cols-1 gap-4 animate-pulse">
          <div className="h-40 bg-slate-100 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-slate-100 dark:bg-slate-900/50 rounded-xl border border-border"></div>
            <div className="h-24 bg-slate-100 dark:bg-slate-900/50 rounded-xl border border-border"></div>
          </div>
        </div>
      ) : (
        /* High Impact Cards */
        <div className="grid grid-cols-1 gap-4">
          {/* Available Balance */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-primary/20 rounded-lg text-primary">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded">Primary Wallet</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Available Balance</p>
            <p className="text-3xl font-extrabold mt-1">LYD {new Intl.NumberFormat().format(overview.total_amount)}</p>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="text-emerald-500 w-4 h-4" />
              <span className="text-emerald-500 text-xs font-bold">+2.4% from last month</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Total Processed */}
            <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">Total Processed</p>
              <p className="text-xl font-bold text-emerald-500">{overview.total_transactions} txns</p>
              <p className="text-[10px] font-bold text-emerald-500/80 mt-2 flex items-center gap-1">
                {overview.success} Success
              </p>
            </div>
            {/* Failed / Pending */}
            <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">Failed & Pending</p>
              <p className="text-xl font-bold text-rose-500">{overview.failed} Failed</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-400">Pending: {overview.pending}</p>
                <Clock className="text-amber-500 w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions Module */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Recent Transactions</h3>
          <button className="text-primary text-sm font-bold hover:underline cursor-pointer">View All</button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
          <input
            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none text-slate-700 dark:text-slate-200"
            placeholder="Search by ID, Phone or Reference"
            type="text"
          />
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-slate-100 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
              No recent transactions in {environment}.
            </div>
          ) : (
            transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between transition-colors hover:bg-slate-200/50 dark:hover:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  {tx.status === 'success' && (
                    <div className="w-10 h-10 shrink-0 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                  {tx.status === 'pending' && (
                    <div className="w-10 h-10 shrink-0 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <Clock className="w-5 h-5" />
                    </div>
                  )}
                  {tx.status === 'failed' && (
                    <div className="w-10 h-10 shrink-0 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                      <XCircle className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      {tx.phone} <span className="text-[10px] font-mono text-slate-400 bg-slate-200 dark:bg-slate-800 px-1.5 rounded">#{tx.id}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      {tx.reference} • {new Date(tx.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold mb-1 ${tx.status === 'success' ? 'text-emerald-500' :
                      tx.status === 'failed' ? 'text-rose-500' : 'text-slate-700 dark:text-slate-200'
                    }`}>
                    {tx.status === 'success' ? '+' : ''} LYD {tx.amount}
                  </p>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${tx.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                      tx.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-rose-500/10 text-rose-500'
                    }`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
