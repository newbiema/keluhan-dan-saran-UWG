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

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <p className="text-sm text-gray-500">
        Memuat detail pengajuan...
      </p>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-2xl space-y-6">
      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-blue-600"
      >
        ← Kembali
      </button>

      {/* HEADER */}
      <div>
        <h1 className="text-xl font-bold">{data.title}</h1>
        <p className="text-sm text-gray-500">
          Dikirim:{" "}
          {new Date(data.created_at).toLocaleString()}
        </p>
        <p className="text-xs text-gray-400">
          Tracking Code: <b>{data.tracking_code}</b>
        </p>
      </div>

      {/* PENGIRIM */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">
          Informasi Pengirim
        </h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 text-xs">Nama</p>
            <p className="font-medium">
              {data.sender_name || "-"}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-xs">Kontak</p>
            <p className="font-medium">
              {data.sender_contact || "-"}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-xs">Modul</p>
            <p className="font-medium">
              {data.module_slug}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-xs">Status</p>
            <p className="font-medium capitalize">
              {data.status}
            </p>
          </div>
        </div>
      </div>

      {/* ISI PENGAJUAN */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-2">
          Isi Pengajuan
        </h3>
        <p className="text-sm whitespace-pre-line">
          {data.content}
        </p>
      </div>

      {/* ADMIN ACTION */}
      <div className="bg-white border rounded-lg p-4 space-y-4">
        <div>
          <label className="text-xs text-gray-500">
            Status Pengajuan
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm mt-1"
          >
            <option value="pending">Pending</option>
            <option value="process">Diproses</option>
            <option value="done">Selesai</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500">
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
            className="text-red-600 text-sm"
          >
            Hapus Pengajuan
          </button>

          <button
            onClick={save}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}
