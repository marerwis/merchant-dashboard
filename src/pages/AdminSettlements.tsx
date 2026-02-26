import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Clock, ShieldAlert, ArrowLeft, ArrowRight, Wallet } from "lucide-react";
import { supabase } from "../api/supabase";

type SettlementRequest = {
    id: number;
    user_id: number;
    amount: string;
    environment: "sandbox" | "live";
    status: "pending" | "approved" | "rejected" | "paid";
    note: string | null;
    created_at: string;
    user?: {
        name: string;
        email: string;
    };
};

export default function AdminSettlements() {
    const [requests, setRequests] = useState<SettlementRequest[]>([]);
    const [status, setStatus] = useState("pending");
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from("settlements")
                .select(`
                    id, 
                    amount, 
                    status, 
                    environment, 
                    created_at, 
                    user_id
                `, { count: "exact" });

            if (status) {
                query = query.eq("status", status);
            }

            const limit = 10;
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            const { data, count, error } = await query
                .order("created_at", { ascending: false })
                .range(from, to);

            if (error) throw error;

            // Map standard auth users (mock for demo since we don't have a profiles table)
            const mappedData = (data || []).map(req => ({
                ...req,
                user: {
                    name: "Merchant User",
                    email: req.user_id ? `${req.user_id.substring(0, 8)}@merchant.test` : "unknown@demo.test"
                }
            }));

            setRequests(mappedData as any);
            setLastPage(count ? Math.ceil(count / limit) : 1);
        } catch (e) {
            console.error("Failed to load settlement requests", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
    }, [status]);

    useEffect(() => {
        fetchRequests();
    }, [status, page]);

    const handleAction = async (id: number, action: "approved" | "rejected", reason?: string) => {
        if (!confirm(`Are you sure you want to ${action} this settlement?`)) return;

        setActionLoading(id);
        try {
            const { error } = await supabase
                .from("settlements")
                .update({
                    status: action,
                    note: reason || null
                })
                .eq("id", id);

            if (error) throw error;
            fetchRequests(); // refresh list
        } catch (e) {
            console.error(`Failed to ${action} settlement`, e);
            alert(`Failed to ${action} settlement`);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-destructive flex items-center gap-3">
                        <ShieldAlert className="h-8 w-8" />
                        Super Admin: Settlements
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Review and approve pending withdrawal requests from merchants across all environments.
                    </p>
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card shadow-sm p-4">
                {/* ===== Filters ===== */}
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                    <div className="relative w-full sm:w-[220px]">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none"
                        >
                            <option value="pending">Pending Review</option>
                            <option value="approved">Approved</option>
                            <option value="paid">Paid</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* ===== Table ===== */}
                <div className="rounded-md border border-border overflow-hidden">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b border-border bg-muted/40">
                                <tr className="border-b transition-colors hover:bg-muted/50">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID / Env</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Merchant</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground">Loading requests...</td>
                                    </tr>
                                ) : requests.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Wallet className="h-8 w-8 text-muted-foreground/50" />
                                                <p>No {status} settlement requests found.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    requests.map((req) => (
                                        <tr key={req.id} className="border-b border-border transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle">
                                                <div className="font-medium text-foreground">#{req.id}</div>
                                                <div className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${req.environment === 'live' ? 'text-primary' : 'text-muted-foreground'
                                                    }`}>
                                                    {req.environment}
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <div className="font-medium text-foreground">{req.user?.name || "Unknown Merchant"}</div>
                                                <div className="text-xs text-muted-foreground">{req.user?.email}</div>
                                            </td>
                                            <td className="p-4 align-middle font-bold text-foreground">
                                                LYD {parseFloat(req.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-4 align-middle">
                                                {req.status === "pending" && <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-orange-500/15 text-orange-500"><Clock className="h-3.5 w-3.5" /> Pending</span>}
                                                {req.status === "approved" && <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-500/15 text-blue-500"><CheckCircle2 className="h-3.5 w-3.5" /> Approved</span>}
                                                {req.status === "paid" && <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/15 text-emerald-500"><CheckCircle2 className="h-3.5 w-3.5" /> Paid</span>}
                                                {req.status === "rejected" && <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-rose-500/15 text-rose-500"><XCircle className="h-3.5 w-3.5" /> Rejected</span>}
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground text-sm">
                                                {new Date(req.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                {req.status === "pending" && (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleAction(req.id, "approved")}
                                                            disabled={actionLoading === req.id}
                                                            className="rounded-md bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                const reason = prompt("Reason for rejection:");
                                                                if (reason !== null) handleAction(req.id, "rejected", reason);
                                                            }}
                                                            disabled={actionLoading === req.id}
                                                            className="rounded-md bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                                {req.status !== "pending" && (
                                                    <span className="text-xs text-muted-foreground italic">Processed</span>
                                                )}
                                            </td>
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
                        Page <span className="font-medium text-foreground">{page}</span> of{" "}
                        <span className="font-medium text-foreground">{lastPage}</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" /> Prev
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(lastPage, p + 1))}
                            disabled={page >= lastPage}
                            className="flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors"
                        >
                            Next <ArrowRight className="h-4 w-4 ml-1" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
