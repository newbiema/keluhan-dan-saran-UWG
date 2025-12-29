import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import AppShell from "../components/AppShell";
import { supabase } from "../lib/supabase";

// helper generate kode
function generateCode(slug) {
  return (
    slug.slice(0, 3).toUpperCase() +
    "-" +
    Math.random().toString(36).substring(2, 8).toUpperCase()
  );
}

export default function SubmitPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!name || !title || !content) return;

    setLoading(true);

    const tracking_code = generateCode(slug);

    const { error } = await supabase.from("submissions").insert({
      module_slug: slug,
      title,
      content,
      sender_name: name,
      sender_contact: contact,
      tracking_code,
      status: "pending",
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    // simpan tiket ke localStorage
    const saved = JSON.parse(localStorage.getItem("tickets") || "[]");
    saved.unshift({
      tracking_code,
      title,
      module_slug: slug,
      created_at: new Date().toISOString(),
    });
    localStorage.setItem("tickets", JSON.stringify(saved.slice(0, 5)));

    setTicket(tracking_code);
  }

  // ===== SUCCESS SCREEN =====
  if (ticket) {
    return (
      <AppShell title="Pengajuan Terkirim">
        <section className="rounded-3xl bg-green-600 p-5 text-white">
          <p className="text-sm font-semibold">Pengajuan berhasil dikirim 🎉</p>
          <p className="mt-1 text-xs text-white/80">
            Simpan kode ini untuk cek status
          </p>

          <div className="mt-4 rounded-2xl bg-white text-green-700 px-4 py-3 text-center">
            <p className="text-xs">Kode Pengajuan</p>
            <p className="text-lg font-bold tracking-widest">
              {ticket}
            </p>
          </div>

          <button
            onClick={() => navigate("/cek-status")}
            className="mt-4 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-green-700"
          >
            Cek Status Pengajuan
          </button>
        </section>
      </AppShell>
    );
  }

  // ===== FORM =====
  return (
    <AppShell title="Ajukan Pengajuan">
      <form
        onSubmit={submit}
        className="space-y-4 rounded-3xl bg-white p-4 border"
      >
        <div>
          <label className="text-xs text-gray-500">Nama</label>
          <input
            className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama kamu"
            required
          />
        </div>

        <div>
          <label className="text-xs text-gray-500">
            Kontak (Email / WA)
          </label>
          <input
            className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Opsional"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500">Judul</label>
          <input
            className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul singkat"
            required
          />
        </div>

        <div>
          <label className="text-xs text-gray-500">Isi Pengajuan</label>
          <textarea
            rows={5}
            className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Jelaskan keluhan / saran kamu"
            required
          />
        </div>

        <button
          disabled={loading}
          className="w-full rounded-2xl bg-blue-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Mengirim..." : "Kirim Pengajuan"}
        </button>
      </form>
    </AppShell>
  );
}
