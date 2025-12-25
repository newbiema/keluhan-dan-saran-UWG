import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import AppShell from "../components/AppShell";
import { supabase } from "../lib/supabase"; // pastikan sudah ada

export default function SubmitPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [successCode, setSuccessCode] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!title || !content) {
      setError("Judul dan isi wajib diisi");
      return;
    }

    setLoading(true);

    const trackingCode = `LPR-${Date.now().toString().slice(-6)}`;

    const { error } = await supabase.from("submissions").insert({
      module_slug: slug,
      title,
      content,
      sender_name: name || null,
      sender_contact: contact || null,
      tracking_code: trackingCode,
      status: "pending",
    });

    setLoading(false);

    if (error) {
      setError("Gagal mengirim pengajuan");
      console.error(error);
      return;
    }

    setSuccessCode(trackingCode);
  }

  if (successCode) {
    return (
      <AppShell title="Pengajuan Terkirim">
        <section className="rounded-3xl bg-blue-900 text-white p-5 text-center">
          <i className="fa-solid fa-circle-check text-3xl mb-3"></i>
          <p className="text-lg font-semibold">Berhasil dikirim</p>
          <p className="mt-1 text-xs text-white/80">
            Simpan kode berikut untuk cek status
          </p>

          <div className="mt-4 rounded-2xl bg-white text-blue-900 py-3 font-mono font-bold text-lg">
            {successCode}
          </div>

          <button
            onClick={() => navigate("/cek-status")}
            className="mt-5 w-full rounded-2xl bg-white text-blue-900 py-3 text-sm font-semibold"
          >
            Cek Status Pengajuan
          </button>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell title="Form Pengajuan">
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* ===== INFO ===== */}
        <section className="rounded-3xl bg-blue-50 border border-blue-100 p-4">
          <p className="text-sm font-semibold text-blue-900">
            Pengajuan anonim
          </p>
          <p className="text-xs text-blue-800 mt-1">
            Kamu boleh mengosongkan nama & kontak
          </p>
        </section>

        {/* ===== NAMA ===== */}
        <div>
          <label className="text-xs text-gray-600">Nama (opsional)</label>
          <input
            type="text"
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama kamu"
          />
        </div>

        {/* ===== KONTAK ===== */}
        <div>
          <label className="text-xs text-gray-600">
            Kontak (Email / WA, opsional)
          </label>
          <input
            type="text"
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="email@kampus.ac.id"
          />
        </div>

        {/* ===== JUDUL ===== */}
        <div>
          <label className="text-xs text-gray-600">Judul *</label>
          <input
            type="text"
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Ringkasan keluhan / saran"
          />
        </div>

        {/* ===== ISI ===== */}
        <div>
          <label className="text-xs text-gray-600">Isi pengajuan *</label>
          <textarea
            rows="5"
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            placeholder="Jelaskan secara detail..."
          />
        </div>

        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}

        {/* ===== SUBMIT ===== */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Mengirim..." : "Kirim Pengajuan"}
        </button>
      </form>
    </AppShell>
  );
}
