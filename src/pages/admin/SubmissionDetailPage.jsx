import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [status, setStatus] = useState("pending");
  const [adminReply, setAdminReply] = useState("");
  const [loading, setLoading] = useState(true);

  /* ================= FETCH DETAIL ================= */
  const fetchDetail = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      navigate("/admin/dashboard");
      return;
    }

    setData(data);
    setStatus(data.status || "pending");
    setAdminReply(data.admin_reply || "");
    setLoading(false);
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  /* ================= SAVE ================= */
  const save = async () => {
    await supabase
      .from("submissions")
      .update({
        status,
        admin_reply: adminReply,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    alert("Perubahan disimpan");
    fetchDetail();
  };

  /* ================= DELETE ================= */
  const remove = async () => {
    if (!confirm("Hapus pengajuan ini?")) return;

    await supabase.from("submissions").delete().eq("id", id);
    navigate("/admin/dashboard");
  };

  /* ================= UI ================= */
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <i className="fa-solid fa-spinner animate-spin"></i>
        Memuat detail pengajuan...
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-2xl space-y-6">
      {/* ===== BACK ===== */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-blue-600 flex items-center gap-2"
      >
        <i className="fa-solid fa-arrow-left"></i>
        Kembali
      </button>

      {/* ===== HEADER ===== */}
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <i className="fa-solid fa-file-lines text-blue-600"></i>
          {data.title}
        </h1>

        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
          <i className="fa-solid fa-clock"></i>
          {new Date(data.created_at).toLocaleString()}
        </p>

        <p className="text-xs text-gray-400 flex items-center gap-2">
          <i className="fa-solid fa-barcode"></i>
          Tracking Code: <b>{data.tracking_code}</b>
        </p>
      </div>

      {/* ===== PENGIRIM ===== */}
      <div className="bg-white border rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <i className="fa-solid fa-user"></i>
          Informasi Pengirim
        </h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-500">Nama</p>
            <p className="font-medium">{data.sender_name || "-"}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Kontak</p>
            <p className="font-medium">{data.sender_contact || "-"}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Modul</p>
            <p className="font-medium flex items-center gap-1">
              <i className="fa-solid fa-layer-group text-gray-400"></i>
              {data.module_slug}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Status</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs capitalize">
              <i className="fa-solid fa-flag"></i>
              {data.status}
            </span>
          </div>
        </div>
      </div>

      {/* ===== ISI ===== */}
      <div className="bg-white border rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <i className="fa-solid fa-message"></i>
          Isi Pengajuan
        </h3>

        <p className="text-sm whitespace-pre-line text-gray-700">
          {data.content}
        </p>
      </div>

      {/* ===== ADMIN ACTION ===== */}
      <div className="bg-white border rounded-xl p-4 space-y-4">
        <div>
          <label className="text-xs text-gray-500 flex items-center gap-2">
            <i className="fa-solid fa-flag-checkered"></i>
            Status Pengajuan
          </label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded px-2 py-2 text-sm mt-1"
          >
            <option value="pending">Pending</option>
            <option value="process">Diproses</option>
            <option value="done">Selesai</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500 flex items-center gap-2">
            <i className="fa-solid fa-reply"></i>
            Balasan Admin
          </label>

          <textarea
            value={adminReply}
            onChange={(e) => setAdminReply(e.target.value)}
            className="w-full border rounded p-2 text-sm mt-1"
            rows={4}
            placeholder="Tulis balasan untuk pengirim..."
          />
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={remove}
            className="text-red-600 text-sm flex items-center gap-2"
          >
            <i className="fa-solid fa-trash"></i>
            Hapus Pengajuan
          </button>

          <button
            onClick={save}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
          >
            <i className="fa-solid fa-floppy-disk"></i>
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}
