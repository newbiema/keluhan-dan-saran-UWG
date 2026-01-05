import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

/* ===== CHART ===== */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ===== CSV ===== */
import Papa from "papaparse";
import { saveAs } from "file-saver";

export default function DashboardPage() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState(null);

  /* ================= LOAD ROLE FROM admin_profiles ================= */
  useEffect(() => {
    async function loadRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("admin_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setRole(data?.role || "operator");
    }

    loadRole();
  }, []);

  /* ================= FETCH DATA ================= */
  const fetchData = async () => {
    setLoading(true);

    let query = supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (status !== "all") query = query.eq("status", status);

    const { data } = await query;
    setData(data || []);
    setLoading(false);
  };

  /* ================= REALTIME ================= */
  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("submissions-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "submissions" },
        fetchData
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [status]);

  /* ================= DELETE ================= */
  const remove = async (id) => {
    if (role !== "super") return;

    if (!confirm("Hapus pengajuan ini?")) return;
    await supabase.from("submissions").delete().eq("id", id);
    fetchData();
  };

  /* ================= EXPORT CSV ================= */
  const exportCSV = () => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "submissions.csv");
  };

  /* ================= STATS ================= */
  const stats = {
    pending: data.filter((d) => d.status === "pending").length,
    process: data.filter((d) => d.status === "process").length,
    done: data.filter((d) => d.status === "done").length,
  };

  const chartData = [
    { name: "Pending", value: stats.pending },
    { name: "Diproses", value: stats.process },
    { name: "Selesai", value: stats.done },
  ];

  const badge = {
    pending: "bg-yellow-100 text-yellow-700",
    process: "bg-blue-100 text-blue-700",
    done: "bg-green-100 text-green-700",
  };

  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Dashboard</h1>

        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="all">Semua</option>
            <option value="pending">Pending</option>
            <option value="process">Diproses</option>
            <option value="done">Selesai</option>
          </select>

          <button
            onClick={exportCSV}
            className="border rounded px-3 py-1 text-sm"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Statistik Pengajuan</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {loading ? (
          <p className="p-4 text-sm text-gray-500">Loading...</p>
        ) : data.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">Belum ada pengajuan</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Judul</th>
                <th>Status</th>
                <th>Tanggal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr
                  key={d.id}
                  className="border-t hover:bg-gray-50"
                >
                  <td
                    className="p-3 cursor-pointer"
                    onClick={() =>
                      navigate(`/admin/submissions/${d.id}`)
                    }
                  >
                    {d.title}
                  </td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded text-xs ${badge[d.status]}`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td>
                    {new Date(d.created_at).toLocaleDateString()}
                  </td>
                  <td className="text-right pr-3">
                    {role === "super" && (
                      <button
                        onClick={() => remove(d.id)}
                        className="text-red-600 text-xs"
                      >
                        Hapus
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ROLE INFO */}
      <p className="text-xs text-gray-400">
        Role: <b>{role}</b>
      </p>
    </div>
  );
}
