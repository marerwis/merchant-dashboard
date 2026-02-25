import { useEffect, useState } from "react";
import { Webhook as WebhookIcon, Plus, Trash2, Power, History } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/axios";

type Webhook = {
  id: number;
  event: string;
  url: string;
  secret: string;
  is_active: boolean;
};

const EVENTS = [
  "payment.success",
  "payment.failed",
  "payment.pending",
];

export default function Webhooks({ environment }: { environment: "sandbox" | "live" }) {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [event, setEvent] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastSecret, setLastSecret] = useState<string | null>(null);

  const fetchWebhooks = async () => {
    try {
      const res = await api.get("/dashboard/webhooks");
      let data: Webhook[] = [];
      if (Array.isArray(res.data)) data = res.data;
      else if (Array.isArray(res.data?.data)) data = res.data.data;
      setWebhooks(data);
    } catch (e) {
      console.error("Failed to load webhooks", e);
      setWebhooks([]);
    }
  };

  useEffect(() => {
    setLastSecret(null);
    fetchWebhooks();
  }, [environment]);

  const createWebhook = async () => {
    if (!event || !url) return;
    setLoading(true);
    try {
      const res = await api.post("/dashboard/webhooks", { event, url });
      const newWebhook: Webhook = res.data?.data ?? res.data ?? null;
      if (newWebhook) {
        setWebhooks((prev) => Array.isArray(prev) ? [...prev, newWebhook] : [newWebhook]);
        setLastSecret(newWebhook.secret ?? null);
      }
      setEvent("");
      setUrl("");
    } catch (e) {
      console.error("Failed to create webhook", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleWebhook = async (id: number) => {
    await api.patch(`/dashboard/webhooks/${id}/toggle`);
    fetchWebhooks();
  };

  const deleteWebhook = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this webhook?")) return;
    await api.delete(`/dashboard/webhooks/${id}`);
    fetchWebhooks();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <WebhookIcon className="h-8 w-8 text-primary" />
            Webhooks
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Configure URL endpoints to receive <span className="font-semibold text-primary uppercase">{environment}</span> event notifications.
          </p>
        </div>

        <Link
          to="/dashboard/webhook-logs"
          className="flex items-center justify-center gap-2 rounded-md border border-border bg-card text-foreground hover:bg-muted/50 px-4 py-2 text-sm font-medium transition-colors"
        >
          <History className="h-4 w-4" />
          View Delivery Logs
        </Link>
      </div>

      {lastSecret && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 animate-in slide-in-from-top-4">
          <div className="flex items-start">
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-amber-500">Webhook Secret Generated</h3>
              <div className="mt-2 text-sm text-amber-500/80">
                <p>Please copy this secret now. It will not be shown again.</p>
                <code className="mt-2 block w-full rounded bg-amber-500/20 px-3 py-2 font-mono break-all text-amber-500">
                  {lastSecret}
                </code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Webhook */}
      <div className="rounded-xl border border-border bg-card shadow-sm p-6">
        <h3 className="text-lg font-medium text-foreground mb-4">Add Endpoint</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={event}
            onChange={(e) => setEvent(e.target.value)}
            className="flex h-10 w-full sm:w-64 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none"
          >
            <option value="">Select Event Type</option>
            {EVENTS.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>

          <input
            type="url"
            placeholder="https://your-domain.com/webhook"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex h-10 w-full flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />

          <button
            onClick={createWebhook}
            disabled={loading || !event || !url}
            className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add Endpoint
          </button>
        </div>
      </div>

      {/* Webhooks Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b border-border bg-muted/40">
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Event</th>
                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground w-1/2">URL Endpoint</th>
                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {!Array.isArray(webhooks) || webhooks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    No webhooks configured for this environment.
                  </td>
                </tr>
              ) : (
                webhooks.map((w) => (
                  <tr key={w.id} className="border-b border-border transition-colors hover:bg-muted/50">
                    <td className="p-6 align-middle font-medium font-mono text-xs text-foreground">{w.event}</td>
                    <td className="p-6 align-middle text-muted-foreground font-mono text-xs truncate max-w-[200px]">{w.url}</td>
                    <td className="p-6 align-middle">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${w.is_active ? "bg-emerald-500/15 text-emerald-500" : "bg-muted text-muted-foreground"
                        }`}>
                        {w.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="p-6 align-middle text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => toggleWebhook(w.id)}
                          title={w.is_active ? "Disable" : "Enable"}
                          className="rounded-md border border-border bg-background p-2 text-muted-foreground hover:bg-muted transition-colors"
                        >
                          <Power className={`h-4 w-4 ${w.is_active ? "text-emerald-500" : ""}`} />
                        </button>
                        <button
                          onClick={() => deleteWebhook(w.id)}
                          title="Delete"
                          className="rounded-md border border-border bg-background p-2 text-rose-500 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
