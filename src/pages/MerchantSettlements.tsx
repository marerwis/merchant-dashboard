import { useEffect, useState } from "react";
import { Wallet, ArrowRightLeft, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import api from "../api/axios";

type BalanceData = {
    totalCredits: number;
    totalDebits: number;
    lockedBalance: number;
    availableBalance: number;
};

type SettlementRequest = {
    id: number;
    amount: string;
    environment: "sandbox" | "live";
    status: "pending" | "approved" | "rejected" | "paid";
    note: string | null;
    created_at: string;
};

export default function MerchantSettlements({ environment }: { environment: "sandbox" | "live" }) {
    const [balance, setBalance] = useState<BalanceData | null>(null);
    const [history, setHistory] = useState<SettlementRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [requestAmount, setRequestAmount] = useState("");
    const [requestLoading, setRequestLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const balanceRes = await api.get("/dashboard/balance");
            setBalance(balanceRes.data.data);

            const historyRes = await api.get("/dashboard/settlements");
            const payload = historyRes.data?.data ?? historyRes.data;
            const items = Array.isArray(payload?.data)
                ? payload.data
                : Array.isArray(payload)
                    ? payload
                    : [];
            setHistory(items);
        } catch (e) {
            console.error("Failed to fetch settlement data:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [environment]);

    const handleRequestPayout = async (e: React.FormEvent) => {
        e.preventDefault();
        const amountNum = parseFloat(requestAmount);

        if (isNaN(amountNum) || amountNum <= 0) {
            alert("Please enter a valid amount greater than 0.");
            return;
        }

        if (balance && amountNum > balance.availableBalance) {
            alert("You cannot request more than your available balance.");
            return;
        }

        setRequestLoading(true);
        try {
            await api.post("/dashboard/settlements", { amount: amountNum });
            setRequestAmount("");
            alert("Payout request submitted successfully.");
            fetchData(); // Refresh balance and history
        } catch (e: any) {
            console.error("Payout request failed:", e);
            alert(e.response?.data?.message || "Failed to submit payout request.");
        } finally {
            setRequestLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                    <Wallet className="h-8 w-8 text-primary" />
                    Payouts & Settlements
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                    Manage your <span className="font-semibold text-primary uppercase">{environment}</span> balance and request withdrawals to your bank account.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Balance Overview Card */}
                <div className="lg:col-span-1 rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 bg-primary/5 border-b border-primary/10">
                        <h3 className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            Available Balance
                        </h3>
                        {loading || !balance ? (
                            <div className="h-10 w-32 bg-muted/50 rounded animate-pulse"></div>
                        ) : (
                            <div className="text-4xl font-bold text-foreground tracking-tight">
                                LYD {balance.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-background flex-1 flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Total Processed (Credits)</span>
                                <span className="font-medium text-emerald-500">
                                    {loading || !balance ? "..." : `+ LYD ${balance.totalCredits.toLocaleString()}`}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Total Withdrawn (Debits)</span>
                                <span className="font-medium text-rose-500">
                                    {loading || !balance ? "..." : `- LYD ${balance.totalDebits.toLocaleString()}`}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm pt-4 border-t border-border">
                                <span className="text-muted-foreground flex items-center gap-1">
                                    Locked Funds <AlertCircle className="h-3 w-3 inline-block ml-1" />
                                </span>
                                <span className="font-medium text-orange-500">
                                    {loading || !balance ? "..." : `LYD ${balance.lockedBalance.toLocaleString()}`}
                                </span>
                            </div>
                        </div>

                        {/* Request Payout Form */}
                        <form onSubmit={handleRequestPayout} className="pt-6 border-t border-border space-y-4">
                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-foreground mb-1">
                                    Request Withdrawal
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-muted-foreground sm:text-sm">LYD</span>
                                    </div>
                                    <input
                                        type="number"
                                        name="amount"
                                        id="amount"
                                        step="0.01"
                                        min="1"
                                        max={balance ? balance.availableBalance : ""}
                                        value={requestAmount}
                                        onChange={(e) => setRequestAmount(e.target.value)}
                                        className="block w-full rounded-md border-input bg-background pl-12 pr-12 py-2 text-foreground focus:border-primary focus:ring-primary sm:text-sm border transition-colors"
                                        placeholder="0.00"
                                        required
                                        disabled={!!(loading || requestLoading || (balance && balance.availableBalance <= 0))}
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <button
                                            type="button"
                                            onClick={() => balance && setRequestAmount(balance.availableBalance.toString())}
                                            className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                                            disabled={!balance || balance.availableBalance <= 0}
                                        >
                                            MAX
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={!!(loading || requestLoading || !requestAmount || (balance && balance.availableBalance <= 0))}
                                className="flex w-full items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 transition-colors gap-2"
                            >
                                <ArrowRightLeft className={`h-4 w-4 ${requestLoading ? 'animate-spin' : ''}`} />
                                {requestLoading ? "Submitting..." : "Submit Request"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Withdrawal History */}
                <div className="lg:col-span-2 rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-border bg-muted/20">
                        <h3 className="text-lg font-semibold text-foreground">Withdrawal History</h3>
                        <p className="text-sm text-muted-foreground mt-1">Recent settlement requests and their current status.</p>
                    </div>

                    <div className="flex-1 overflow-auto bg-background">
                        <table className="w-full caption-bottom text-sm relative">
                            <thead className="[&_tr]:border-b border-border bg-muted/40 sticky top-0 z-10 backdrop-blur-sm">
                                <tr className="border-b transition-colors hover:bg-muted/50">
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0 border-t border-border">
                                {loading ? (
                                    <tr>
                                        <td colSpan={3} className="p-8 text-center text-muted-foreground">Loading history...</td>
                                    </tr>
                                ) : history.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="p-12 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <ArrowRightLeft className="h-8 w-8 text-muted-foreground/50" />
                                                <p>No withdrawal requests found.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    history.map((req) => (
                                        <tr key={req.id} className="border-b border-border transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle text-muted-foreground">
                                                {new Date(req.created_at).toLocaleDateString()}
                                                <span className="text-xs ml-2 opacity-50">{new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </td>
                                            <td className="p-4 align-middle font-semibold text-foreground">
                                                LYD {parseFloat(req.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-4 align-middle">
                                                {req.status === "pending" && <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-orange-500/15 text-orange-500"><Clock className="h-3.5 w-3.5" /> Pending</span>}
                                                {req.status === "approved" && <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-500/15 text-blue-500"><CheckCircle2 className="h-3.5 w-3.5" /> Approved</span>}
                                                {req.status === "paid" && <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/15 text-emerald-500"><CheckCircle2 className="h-3.5 w-3.5" /> Paid</span>}
                                                {req.status === "rejected" && <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-rose-500/15 text-rose-500"><XCircle className="h-3.5 w-3.5" /> Rejected</span>}
                                            </td>
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
