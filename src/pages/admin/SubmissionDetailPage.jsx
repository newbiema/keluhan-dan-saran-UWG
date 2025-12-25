import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState("pending");

  async function fetchDetail() {
    const { data } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", id)
      .single();

    if (!data) return navigate("/admin/dashboard");

    setData(data);
    setReply(data.reply || "");
    setStatus(data.status);
  }

  async function save() {
    await supabase
      .from("submissions")
      .update({ reply, status })
      .eq("id", id);

    alert("Tersimpan");
    fetchDetail();
  }

  async function remove() {
    if (!confirm("Hapus pengajuan ini?")) return;

    await supabase.from("submissions").delete().eq("id", id);
    navigate("/admin/dashboard");
  }

  useEffect(() => {
    fetchDetail();
  }, []);

  if (!data) return null;

  return (
    <div className="max-w-xl">
      <button
        onClick={() => navigate(-1)}
        className="text-sm mb-3 text-blue-600"
      >
        ← Kembali
      </button>

      <h1 className="text-xl font-bold mb-1">{data.title}</h1>
      <p className="text-sm text-gray-500 mb-4">
        {new Date(data.created_at).toLocaleString()}
      </p>

      <div className="bg-white border rounded p-4 space-y-4">
        <div>
          <p className="text-xs text-gray-500">Isi Pengajuan</p>
          <p className="text-sm">{data.message}</p>
        </div>

        <div>
          <label className="text-xs">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm"
          >
            <option value="pending">Pending</option>
            <option value="process">Diproses</option>
            <option value="done">Selesai</option>
          </select>
        </div>

        <div>
          <label className="text-xs">Balasan</label>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="w-full border rounded p-2 text-sm"
            rows={4}
          />
        </div>

        <div className="flex justify-between">
          <button
            onClick={remove}
            className="text-red-600 text-sm"
          >
            Hapus
          </button>

          <button
            onClick={save}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
