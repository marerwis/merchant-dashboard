import { useEffect, useState } from "react";
import { KeyRound, Eye, EyeOff, Copy, RefreshCw, AlertTriangle } from "lucide-react";
import { supabase } from "../api/supabase";

type ApiData = {
  public_key: string;
  secret_key: string;
};

export default function ApiKeys({ environment }: { environment: "sandbox" | "live" }) {
  const [data, setData] = useState<ApiData | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setData(null);
    setShowSecret(false);

    const fetchKeys = async () => {
      try {
        const { data, error } = await supabase
          .from("api_keys")
          .select("*")
          .eq("environment", environment)
          .limit(1)
          .maybeSingle();

        if (data) {
          setData(data as ApiData);
        } else {
          // Mock data if no key exists yet for the demo
          setData({
            public_key: `pk_${environment}_mock_key_generated`,
            secret_key: `sk_${environment}_mock_secret_do_not_share`
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchKeys();
  }, [environment]);

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerateSecret = async () => {
    const confirm = window.confirm(
      "⚠️ Warning!\nRegenerating API Secret will invalidate the old one.\nAre you sure you want to proceed?"
    );

    if (!confirm) return;

    setLoading(true);

    try {
      const newSecret = "sk_" + environment + "_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      const { data: updated, error } = await supabase
        .from("api_keys")
        .update({ secret_key: newSecret })
        .eq("environment", environment)
        .select()
        .maybeSingle();

      if (updated) {
        setData(updated as ApiData);
      } else {
        // Fallback for mock demo
        setData(prev => prev ? { ...prev, secret_key: newSecret } : null);
      }
      setShowSecret(false);
    } catch (e) {
      console.error("Failed to regenerate secret");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">API Credentials</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your API keys for the <span className="font-semibold text-primary uppercase">{environment}</span> environment.
        </p>
      </div>

      {!data ? (
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm animate-pulse h-64"></div>
      ) : (
        <div className="space-y-6">
          {/* API KEY */}
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-border bg-muted/20">
              <h3 className="text-lg font-medium leading-6 text-foreground flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                Public API Key
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Use this key to authenticate public requests. It is safe to expose in client-side code.
              </p>
            </div>
            <div className="p-6 bg-background">
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-muted/50 border border-border rounded-md px-4 py-3 font-mono text-sm text-foreground overflow-x-auto">
                  {data.public_key}
                </div>
                <button
                  onClick={() => copyToClipboard(data.public_key)}
                  className="flex shrink-0 items-center justify-center gap-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-3 text-sm font-medium transition-colors"
                >
                  {copied ? <span className="text-emerald-500">Copied!</span> : <><Copy className="h-4 w-4" /> Copy</>}
                </button>
              </div>
            </div>
          </div>

          {/* API SECRET */}
          <div className="rounded-xl border border-rose-500/20 bg-card shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-rose-500/20 bg-rose-500/5">
              <h3 className="text-lg font-medium leading-6 text-rose-500 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Secret API Key
              </h3>
              <p className="mt-1 text-sm text-rose-500/80">
                This key can perform any action on your account. Keep it absolutely secret.
              </p>
            </div>
            <div className="p-6 bg-background space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-muted/50 border border-rose-500/30 rounded-md px-4 py-3 font-mono text-sm text-foreground overflow-x-auto flex items-center justify-between">
                  <span>{showSecret ? data.secret_key : "••••••••••••••••••••••••••••••••••••••••••••••••••"}</span>
                  <button
                    onClick={() => setShowSecret(!showSecret)}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <button
                  onClick={regenerateSecret}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Roll Secret Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
