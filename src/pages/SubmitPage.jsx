import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AppShell from "../components/AppShell";
import { supabase } from "../lib/supabase";
import Swal from "sweetalert2";
import { toastSuccess, toastError } from "../lib/toast";

/* ===== MODULE CONFIG ===== */
const MODULES = {
  "keluhan-fasilitas": {
    name: "Keluhan Fasilitas",
    desc: "Lapor kerusakan fasilitas kampus, kebersihan, keamanan, dll.",
    icon: "fa-building-circle-exclamation",
  },
  "saran-akademik": {
    name: "Saran Akademik",
    desc: "Masukan untuk perkuliahan, jadwal, kurikulum, dosen, dll.",
    icon: "fa-graduation-cap",
  },
  administrasi: {
    name: "Administrasi",
    desc: "Layanan TU, surat-menyurat, pembayaran, dan administrasi.",
    icon: "fa-file-lines",
  },
};

/* ===== helper generate kode ===== */
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
  const module = MODULES[slug];

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  /* redirect kalau slug tidak valid */
  useEffect(() => {
    if (!module) navigate("/");
  }, [module, navigate]);

  async function submit(e) {
    e.preventDefault();
    if (!name || !title || !content) {
      toastError("Lengkapi semua field wajib");
      return;
    }

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

    /* ===== ERROR ===== */
    if (error) {
      toastError("Gagal mengirim pengajuan");
      return;
    }

    /* ===== SIMPAN TIKET (LOCAL) ===== */
    const saved = JSON.parse(localStorage.getItem("tickets") || "[]");
    saved.unshift({
      tracking_code,
      title,
      module_slug: slug,
      created_at: new Date().toISOString(),
    });
    localStorage.setItem("tickets", JSON.stringify(saved.slice(0, 5)));

    /* ===== SUCCESS MODAL ===== */
Swal.fire({
  icon: "success",
  title: "Pengajuan Berhasil 🎉",
  html: `
    <p style="font-size:13px;color:#555;margin-bottom:6px">
      ${module.name}
    </p>
    <div style="
      background:#f0fdf4;
      border:1px solid #86efac;
      border-radius:12px;
      padding:12px;
      margin-top:8px
    ">
      <p style="font-size:11px;color:#16a34a;margin-bottom:4px">
        KODE PENGAJUAN
      </p>
      <p style="
        font-size:18px;
        font-weight:700;
        letter-spacing:3px;
        color:#166534
      ">
        ${tracking_code}
      </p>
    </div>
  `,
  showCancelButton: true,
  confirmButtonText: "Cek Status",
  cancelButtonText: "Tutup",
  confirmButtonColor: "#16a34a",
}).then((res) => {
  // copy + toast SETELAH modal
  navigator.clipboard.writeText(tracking_code);
  toastSuccess("Kode pengajuan disalin");

  if (res.isConfirmed) {
    navigate("/cek-status");
  }
});

  }

  /* ===== FORM ===== */
  return (
    <AppShell title={`Ajukan ${module?.name || ""}`}>
      {/* ===== MODULE INFO ===== */}
      <section className="mb-4 rounded-3xl bg-blue-900 p-4 text-white">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-2xl bg-white/10 flex items-center justify-center">
            <i className={`fa-solid ${module.icon}`}></i>
          </div>
          <div>
            <p className="text-sm font-semibold">{module.name}</p>
            <p className="text-xs text-white/70 mt-1">{module.desc}</p>
          </div>
        </div>
      </section>

      {/* ===== FORM CARD ===== */}
      <form
        onSubmit={submit}
        className="space-y-4 rounded-3xl bg-white p-4 border"
      >
        {/* Nama */}
        <div>
          <label className="text-xs text-gray-500">Nama</label>
          <div className="mt-1 flex items-center gap-2 rounded-2xl border px-4 py-3">
            <i className="fa-solid fa-user text-gray-400"></i>
            <input
              className="w-full text-sm outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama kamu"
              required
            />
          </div>
        </div>

        {/* Kontak */}
        <div>
          <label className="text-xs text-gray-500">
            Kontak (Email / WA)
          </label>
          <div className="mt-1 flex items-center gap-2 rounded-2xl border px-4 py-3">
            <i className="fa-solid fa-envelope text-gray-400"></i>
            <input
              className="w-full text-sm outline-none"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Opsional"
            />
          </div>
        </div>

        {/* Judul */}
        <div>
          <label className="text-xs text-gray-500">Judul</label>
          <div className="mt-1 flex items-center gap-2 rounded-2xl border px-4 py-3">
            <i className="fa-solid fa-heading text-gray-400"></i>
            <input
              className="w-full text-sm outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Judul ${module.name.toLowerCase()}`}
              required
            />
          </div>
        </div>

        {/* Isi */}
        <div>
          <label className="text-xs text-gray-500">Isi Pengajuan</label>
          <div className="mt-1 flex items-start gap-2 rounded-2xl border px-4 py-3">
            <i className="fa-solid fa-pen-to-square text-gray-400 mt-1"></i>
            <textarea
              rows={5}
              className="w-full text-sm outline-none resize-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Jelaskan ${module.name.toLowerCase()} kamu`}
              required
            />
          </div>
        </div>

        {/* Submit */}
      <button
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 active:scale-[0.98] transition"
      >
        {loading ? (
          <>
            <i className="fa-solid fa-circle-notch fa-spin"></i>
            Mengirim...
          </>
        ) : (
          <>
            <i className="fa-solid fa-paper-plane"></i>
            Kirim Pengajuan
          </>
        )}
      </button>

      </form>
    </AppShell>
  );
}
