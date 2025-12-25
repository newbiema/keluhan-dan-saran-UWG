import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const navigate = useNavigate();

  async function fetchData() {
    setLoading(true);

    let query = supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (!error) setData(data || []);
    setLoading(false);
  }

  async function deleteSubmission(id) {
    if (!confirm("Hapus pengajuan ini?")) return;

    await supabase.from("submissions").delete().eq("id", id);
    fetchData();
  }

  useEffect(() => {
    fetchData();
  }, [status]);

  const badge = {
    pending: "bg-yellow-100 text-yellow-700",
    process: "bg-blue-100 text-blue-700",
    done: "bg-green-100 text-green-700",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Dashboard</h1>

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
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : data.length === 0 ? (
        <p className="text-sm text-gray-500">Belum ada pengajuan</p>
      ) : (
        <div className="bg-white rounded border overflow-hidden">
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
                    <button
                      onClick={() => deleteSubmission(d.id)}
                      className="text-red-600 text-xs"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
