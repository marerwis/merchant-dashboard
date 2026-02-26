import { useEffect, useState } from "react";
import { History, Filter, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../api/supabase";

type WebhookLog = {
  id: number;
  event: string;
  status: "success" | "failed" | "pending";
  attempt: number;
  http_status: number | null;
  error: string | null;
  created_at: string;
};

export default function WebhookLogs({ environment }: { environment: "sandbox" | "live" }) {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [event, setEvent] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("webhook_logs")
        .select("*", { count: "exact" });

      if (event) {
        query = query.eq("event", event);
      }
      if (status) {
        query = query.eq("status", status);
      }

      const limit = 10;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, count, error } = await query
        .range(from, to)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setLogs((data as WebhookLog[]) || []);
      setLastPage(count ? Math.ceil(count / limit) : 1);
    } catch (e) {
      console.error("Failed to load webhook logs", e);
      setLogs([]);
      setLastPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [event, status, environment]);

  useEffect(() => {
    fetchLogs();
  }, [event, status, page, environment]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard/webhooks" className="p-2 -ml-2 rounded-md hover:bg-muted text-muted-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <History className="h-8 w-8 text-primary" />
              Delivery Logs
            </h2>
          </div>
          <p className="text-muted-foreground mt-1 text-sm ml-11">
            History of webhook deliveries for the <span className="font-semibold text-primary uppercase">{environment}</span> environment.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm p-4">
        {/* ===== Filters ===== */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="relative w-full sm:w-[220px]">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
            </div>
            <select
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background pl-10 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none"
            >
              <option value="">All Events</option>
              <option value="payment.success">payment.success</option>
              <option value="payment.failed">payment.failed</option>
            </select>
          </div>

          <div className="relative w-full sm:w-[180px]">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* ===== Table ===== */}
        <div className="rounded-md border border-border overflow-hidden">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b border-border bg-muted/40">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[80px]">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Event</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">HTTP Code</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Attempt</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Error Context</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">Loading logs...</td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <History className="h-8 w-8 text-muted-foreground/50" />
                        <p>No delivery logs found matching your criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="border-b border-border transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle">
                        {log.status === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                        {log.status === "failed" && <AlertCircle className="h-5 w-5 text-rose-500" />}
                        {log.status === "pending" && <Clock className="h-5 w-5 text-orange-500" />}
                      </td>
                      <td className="p-4 align-middle font-mono text-xs text-foreground">{log.event}</td>
                      <td className="p-4 align-middle font-medium text-foreground">
                        {log.http_status ? (
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${log.http_status >= 200 && log.http_status < 300 ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500'
                            }`}>
                            {log.http_status}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">#{log.attempt}</td>
                      <td className="p-4 align-middle text-rose-500 font-mono text-xs max-w-xs truncate" title={log.error || ""}>
                        {log.error || "-"}
                      </td>
                      <td className="p-4 align-middle text-right text-muted-foreground">{new Date(log.created_at).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-2 pt-4">
          <p className="text-sm text-muted-foreground">
            Showing page <span className="font-medium text-foreground">{page}</span> of <span className="font-medium text-foreground">{lastPage}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= lastPage}
              className="flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
