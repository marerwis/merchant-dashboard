import { useEffect, useState } from "react";
import api from "../api/axios";

type Credentials = {
  api_key: string;
  api_secret: string;
};

export default function ApiCredentials() {
  const [data, setData] = useState<Credentials | null>(null);
  const [loading, setLoading] = useState(true);

  // جلب الـ API Key & Secret
  const fetchCredentials = async () => {
    try {
      const res = await api.get("/dashboard/api-credentials");
      setData(res.data.data);
    } catch (error) {
      alert("فشل تحميل بيانات API");
    } finally {
      setLoading(false);
    }
  };

  // إعادة توليد API Secret
  const regenerateSecret = async () => {
    if (!confirm("هل أنت متأكد من إعادة توليد API Secret؟")) return;

    try {
      const res = await api.post("/dashboard/regenerate-api-secret");
      setData(res.data.data);
      alert("تم إنشاء API Secret جديد");
    } catch (error) {
      alert("فشل إعادة التوليد");
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>No data</p>;

  return (
    <div className="card">
      <h2>API Credentials</h2>

      <p>
        <strong>API Key:</strong>
        <br />
        <code>{data.api_key}</code>
      </p>

      <p>
        <strong>API Secret:</strong>
        <br />
        <code>{data.api_secret}</code>
      </p>

      <button onClick={regenerateSecret}>
        🔄 Regenerate API Secret
      </button>
    </div>
  );
}
