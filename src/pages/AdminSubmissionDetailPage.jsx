import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AdminSubmissionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ================= FETCH DATA ================= */
  const fetchDetail = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", id)
      .single();

    if (!error) {
      setData(data);
      setReply(data.admin_reply || "");
      setStatus(data.status);
    }

    setLoading(false);
  };

  /* ================= EFFECT ================= */
  useEffect(() => {
    fetchDetail();
  }, [id]);

  /* ================= SAVE ================= */
  const handleSave = async () => {
    setSaving(true);

    await supabase
      .from("submissions")
      .update({
        admin_reply: reply,
        status,
      })
      .eq("id", id);

    setSaving(false);
    alert("Berhasil disimpan");
    fetchDetail();
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    const ok = confirm("Yakin ingin menghapus pengajuan ini?");
    if (!ok) return;

    await supabase.from("submissions").delete().eq("id", id);
    alert("Data dihapus");
    navigate("/admin/dashboard");
  };

  /* ================= UI ================= */
  if (loading) {
    return <p className="p-6 text-sm text-gray-500">Memuat data...</p>;
  }

  if (!data) {
    return <p className="p-6 text-sm text-red-500">Data tidak ditemukan</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-bold">Detail Pengajuan</h1>
        <button
          onClick={handleDelete}
          className="text-sm text-red-600 hover:underline"
        >
          Hapus
        </button>
      </div>

      {/* Info */}
      <div className="rounded-xl border p-4 space-y-2">
        <p className="font-semibold">{data.title}</p>
        <p className="text-sm text-gray-600">{data.description}</p>

        <div className="text-xs text-gray-500 mt-3">
          <p>Modul: {data.module_slug}</p>
          <p>Kode: {data.tracking_code}</p>
          <p>
            Dibuat: {new Date(data.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm w-full"
        >
          <option value="pending">Pending</option>
          <option value="diproses">Diproses</option>
          <option value="selesai">Selesai</option>
        </select>
      </div>

      {/* Reply */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Balasan Admin
        </label>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          rows={5}
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Tulis balasan untuk mahasiswa..."
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </button>

        <button
          onClick={() => navigate(-1)}
          className="border px-4 py-2 rounded-lg text-sm"
        >
          Kembali
        </button>
      </div>
    </div>
  );
}
