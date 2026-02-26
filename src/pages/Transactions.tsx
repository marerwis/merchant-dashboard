import { useEffect, useState } from "react";
import { Search, Filter, ReceiptText } from "lucide-react";
import { supabase } from "../api/supabase";

type Transaction = {
  id: number;
  phone: string;
  amount: string;
  status: "success" | "pending" | "failed";
  reference: string;
  created_at: string;
};

export default function Transactions({ environment }: { environment: "sandbox" | "live" }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filtered, setFiltered] = useState<Transaction[]>([]);
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("environment", environment)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTransactions(data as Transaction[] || []);
        setFiltered(data as Transaction[] || []);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [environment]);

  useEffect(() => {
    let result = transactions;

    if (status !== "all") {
      result = result.filter((t) => t.status === status);
    }

    if (search.trim() !== "") {
      result = result.filter(
        (t) =>
          t.phone.includes(search) ||
          t.reference.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(result);
  }, [status, search, transactions]);

  const statusClass = (status: string) => {
    if (status === "success") return "bg-emerald-500/15 text-emerald-500 border border-emerald-500/20";
    if (status === "pending") return "bg-orange-500/15 text-orange-500 border border-orange-500/20";
    return "bg-rose-500/15 text-rose-500 border border-rose-500/20";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Transactions</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Detailed history of all your <span className="font-semibold text-primary uppercase">{environment}</span> transactions.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm p-4">
        {/* ===== Filters ===== */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="relative w-full sm:max-w-xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Search phone or reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background pl-10 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
            />
          </div>

          <div className="relative w-full sm:w-[180px]">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background pl-10 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* ===== Table ===== */}
        <div className="rounded-md border border-border overflow-hidden">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b border-border bg-muted/40">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[80px]">#</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Phone</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Reference</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground text-right">Date</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">Loading transactions...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <ReceiptText className="h-8 w-8 text-muted-foreground/50" />
                        <p>No transactions found matching your criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((tx) => (
                    <tr key={tx.id} className="border-b border-border transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle font-medium text-foreground">{tx.id}</td>
                      <td className="p-4 align-middle text-muted-foreground">{tx.phone}</td>
                      <td className="p-4 align-middle font-semibold text-foreground">LYD {tx.amount}</td>
                      <td className="p-4 align-middle">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass(tx.status)}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-muted-foreground font-mono text-xs">{tx.reference}</td>
                      <td className="p-4 align-middle text-muted-foreground text-right">{new Date(tx.created_at).toLocaleString()}</td>
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
