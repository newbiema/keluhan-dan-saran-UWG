import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { supabase } from "../lib/supabase";

export default function CheckStatusPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [autoLoaded, setAutoLoaded] = useState(false);

  /* ================= FETCH STATUS ================= */
  const fetchStatus = async (trackingCode) => {
    if (!trackingCode) return;

    setLoading(true);
    setError("");
    setData(null);

    const { data, error } = await supabase
      .from("submissions")
      .select(
        "module_slug,title,content,status,admin_reply,created_at"
      )
      .eq("tracking_code", trackingCode)
      .single();

    if (error || !data) {
      setError("Kode pengajuan tidak ditemukan.");
    } else {
      setData(data);
    }

    setLoading(false);
  };

  /* ================= AUTO LOAD LAST TICKET ================= */
  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("tickets") || "[]"
    );

    if (saved.length > 0 && !autoLoaded) {
      const last = saved[0];
      setCode(last.tracking_code);
      fetchStatus(last.tracking_code);
      setAutoLoaded(true);
    }
  }, [autoLoaded]);

  const statusMap = {
    pending: {
      label: "Menunggu",
      color: "bg-yellow-100 text-yellow-700",
    },
    process: {
      label: "Diproses",
      color: "bg-blue-100 text-blue-700",
    },
    done: {
      label: "Selesai",
      color: "bg-green-100 text-green-700",
    },
  };

  return (
    <AppShell title="Cek Status Pengajuan">
      {/* ===== INPUT ===== */}
      <section className="rounded-3xl bg-blue-900 p-5 text-white">
        <p className="text-sm font-semibold">
          Masukkan Kode Pengajuan
        </p>
        <p className="mt-1 text-xs text-white/70">
          Kode akan otomatis terisi jika kamu pernah mengirim pengajuan
        </p>

        <div className="mt-4 flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Contoh: KEL-8F32A9"
            className="flex-1 rounded-2xl px-4 py-3 text-sm text-black outline-none"
          />
          <button
            onClick={() => fetchStatus(code)}
            disabled={loading}
            className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-blue-900 disabled:opacity-60"
          >
            {loading ? "Cek..." : "Cek"}
          </button>
        </div>
      </section>

      {/* ===== ERROR ===== */}
      {error && (
        <div className="mt-4 rounded-2xl bg-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ===== RESULT ===== */}
      {data && (
        <section className="mt-4 rounded-3xl bg-white p-5 shadow space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold">
                {data.title}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Modul: {data.module_slug}
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                statusMap[data.status]?.color ||
                "bg-gray-100 text-gray-600"
              }`}
            >
              {statusMap[data.status]?.label || data.status}
            </span>
          </div>

          {/* Content */}
          <div>
            <p className="text-xs text-gray-500 mb-1">
              Isi Pengajuan
            </p>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {data.content}
            </p>
          </div>

          {/* Admin Reply */}
          {data.admin_reply ? (
            <div className="rounded-2xl bg-green-50 p-4 text-sm text-green-800">
              <p className="font-semibold mb-1">
                Balasan Admin
              </p>
              <p className="whitespace-pre-line">
                {data.admin_reply}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-gray-50 p-4 text-xs text-gray-500">
              Belum ada balasan dari admin.
            </div>
          )}

          <p className="text-xs text-gray-400">
            Dikirim pada{" "}
            {new Date(data.created_at).toLocaleString()}
          </p>
        </section>
      )}
    </AppShell>
  );
}
