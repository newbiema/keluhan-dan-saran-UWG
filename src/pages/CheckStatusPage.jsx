import { useState } from "react";
import AppShell from "../components/AppShell";
import { supabase } from "../lib/supabase";

export default function CheckStatusPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (!code) return;

    setLoading(true);
    setError("");
    setData(null);

    const { data, error } = await supabase
      .from("submissions")
      .select(
        "module_slug,title,content,status,admin_reply,created_at"
      )
      .eq("tracking_code", code)
      .single();

    if (error) {
      setError("Kode tidak ditemukan atau belum diproses");
    } else {
      setData(data);
    }

    setLoading(false);
  };

  const statusColor = {
    pending: "bg-yellow-100 text-yellow-700",
    diproses: "bg-blue-100 text-blue-700",
    selesai: "bg-green-100 text-green-700",
  };

  return (
    <AppShell title="Cek Status Pengajuan">
      {/* Input */}
      <section className="rounded-3xl bg-blue-900 p-5 text-white">
        <p className="text-sm font-semibold">
          Masukkan Kode Pengajuan
        </p>
        <p className="mt-1 text-xs text-white/70">
          Kode ini kamu dapat setelah mengirim pengajuan
        </p>

        <div className="mt-4 flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Contoh: ABC123XYZ"
            className="flex-1 rounded-2xl px-4 py-3 text-black text-sm outline-none"
          />
          <button
            onClick={handleCheck}
            disabled={loading}
            className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-blue-900 disabled:opacity-50"
          >
            {loading ? "Cek..." : "Cek"}
          </button>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-2xl bg-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Result */}
      {data && (
        <section className="mt-4 rounded-3xl bg-white p-4 shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{data.title}</p>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                statusColor[data.status] || "bg-gray-100 text-gray-600"
              }`}
            >
              {data.status}
            </span>
          </div>

          <p className="mt-2 text-xs text-gray-500">
            Modul: {data.module_slug}
          </p>

          <p className="mt-3 text-sm text-gray-700 whitespace-pre-line">
            {data.content}
          </p>

          {/* Admin Reply */}
          {data.admin_reply && (
            <div className="mt-4 rounded-2xl bg-green-50 p-3 text-sm text-green-800">
              <p className="font-semibold">Balasan Admin</p>
              <p className="mt-1 whitespace-pre-line">
                {data.admin_reply}
              </p>
            </div>
          )}
        </section>
      )}
    </AppShell>
  );
}
