import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const statusBadge = {
  pending: "bg-yellow-100 text-yellow-700",
  diproses: "bg-blue-100 text-blue-700",
  selesai: "bg-green-100 text-green-700",
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  /* ================= FETCH ================= */
  const fetchData = async () => {
    setLoading(true);

    let q = supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (status !== "all") q = q.eq("status", status);

    if (search)
      q = q.or(
        `tracking_code.ilike.%${search}%,title.ilike.%${search}%`
      );

    const { data } = await q;
    setData(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [status]);

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    const ok = confirm("Hapus pengajuan ini?");
    if (!ok) return;

    await supabase.from("submissions").delete().eq("id", id);
    fetchData();
  };

  /* ================= STATS ================= */
  const total = data.length;
  const pending = data.filter((d) => d.status === "pending").length;
  const diproses = data.filter((d) => d.status === "diproses").length;
  const selesai = data.filter((d) => d.status === "selesai").length;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-bold">Dashboard Admin</h1>
        <button
          onClick={fetchData}
          className="text-sm text-blue-600 hover:underline"
        >
          Refresh
        </button>
      </div>

      {/* ===== STATS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total" value={total} />
        <StatCard label="Pending" value={pending} />
        <StatCard label="Diproses" value={diproses} />
        <StatCard label="Selesai" value={selesai} />
      </div>

      {/* ===== FILTER ===== */}
      <div className="flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Cari judul / kode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyUp={fetchData}
          className="border rounded-lg px-3 py-2 text-sm w-full"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="diproses">Diproses</option>
          <option value="selesai">Selesai</option>
        </select>
      </div>

      {/* ===== LIST ===== */}
      {loading ? (
        <p className="text-sm text-gray-500">Memuat data...</p>
      ) : data.length === 0 ? (
        <p className="text-sm text-gray-500">
          Tidak ada pengajuan
        </p>
      ) : (
        <div className="space-y-3">
          {data.map((d) => (
            <div
              key={d.id}
              className="border rounded-xl p-4 hover:shadow transition"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <p className="font-semibold">{d.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {d.module_slug} • {d.tracking_code}
                  </p>
                </div>

                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge[d.status]}`}
                >
                  {d.status}
                </span>
              </div>

              <div className="flex justify-between items-center mt-4">
                <p className="text-xs text-gray-400">
                  {new Date(d.created_at).toLocaleString()}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      navigate(`/admin/submissions/${d.id}`)
                    }
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Detail
                  </button>
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===== STAT CARD ===== */
function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
