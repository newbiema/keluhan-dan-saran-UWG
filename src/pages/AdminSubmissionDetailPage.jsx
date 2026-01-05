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
    return (
      <div className="p-6 text-sm text-muted-foreground flex items-center gap-2">
        <i className="fa-solid fa-spinner animate-spin"></i>
        Memuat data...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-sm text-red-600 flex items-center gap-2">
        <i className="fa-solid fa-circle-xmark"></i>
        Data tidak ditemukan
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <i className="fa-solid fa-file-lines text-blue-600"></i>
          Detail Pengajuan
        </h1>

        <button
          onClick={handleDelete}
          className="text-sm text-red-600 hover:underline flex items-center gap-1"
        >
          <i className="fa-solid fa-trash"></i>
          Hapus
        </button>
      </div>

      {/* ===== INFO CARD ===== */}
      <div className="rounded-xl border bg-white p-4 space-y-3">
        <h2 className="font-semibold text-base flex items-center gap-2">
          <i className="fa-solid fa-heading text-gray-400"></i>
          {data.title}
        </h2>

        <p className="text-sm text-gray-600 leading-relaxed">
          {data.content}
        </p>

        <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 pt-2">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-layer-group"></i>
            Modul: {data.module_slug}
          </div>
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-barcode"></i>
            Kode: {data.tracking_code}
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <i className="fa-solid fa-clock"></i>
            Dibuat: {new Date(data.created_at).toLocaleString()}
          </div>
        </div>
      </div>

      {/* ===== STATUS ===== */}
      <div>
        <label className="block text-sm font-medium mb-1 flex items-center gap-2">
          <i className="fa-solid fa-flag"></i>
          Status Pengajuan
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

      {/* ===== REPLY ===== */}
      <div>
        <label className="block text-sm font-medium mb-1 flex items-center gap-2">
          <i className="fa-solid fa-reply"></i>
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

      {/* ===== ACTIONS ===== */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
        >
          <i className="fa-solid fa-floppy-disk"></i>
          {saving ? "Menyimpan..." : "Simpan"}
        </button>

        <button
          onClick={() => navigate(-1)}
          className="border px-4 py-2 rounded-lg text-sm flex items-center gap-2"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Kembali
        </button>
      </div>
    </div>
  );
}
