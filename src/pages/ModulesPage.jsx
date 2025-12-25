import AppShell from "../components/AppShell";
import { useNavigate } from "react-router-dom";

const modules = [
  {
    name: "Keluhan Fasilitas",
    slug: "keluhan-fasilitas",
    desc: "Lapor kerusakan fasilitas kampus, kebersihan, keamanan, dll.",
    icon: "fa-building-circle-exclamation",
  },
  {
    name: "Saran Akademik",
    slug: "saran-akademik",
    desc: "Masukan untuk perkuliahan, jadwal, kurikulum, dosen, dll.",
    icon: "fa-graduation-cap",
  },
  {
    name: "Administrasi",
    slug: "administrasi",
    desc: "Layanan TU, surat-menyurat, pembayaran, dan administrasi.",
    icon: "fa-file-lines",
  },
];

export default function ModulesPage() {
  const navigate = useNavigate();

  return (
    <AppShell title="Layanan Mahasiswa">
      {/* ===== BANNER ===== */}
      <section className="rounded-3xl bg-blue-900 text-white p-5">
        <p className="text-sm font-semibold">Butuh bantuan?</p>
        <p className="mt-1 text-xs text-white/80">
          Pilih modul layanan, isi form, dan pantau status pengajuan kamu.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-xs text-white/70">Rata-rata respon</p>
            <p className="mt-1 text-lg font-bold">1–3 hari</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-xs text-white/70">Privasi</p>
            <p className="mt-1 text-lg font-bold">Aman</p>
          </div>
        </div>
      </section>

      {/* ===== DAFTAR MODUL ===== */}
      <section className="mt-4 rounded-3xl bg-[#1E3A8A] p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Daftar Modul</p>
          <span className="text-xs text-white/70">
            {modules.length} modul
          </span>
        </div>

        <div className="mt-3 space-y-3">
          {modules.map((m) => (
            <div
              key={m.slug}
              className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur p-4"
            >
              {/* HEADER (klik → detail) */}
              <button
                onClick={() => navigate(`/modules/${m.slug}`)}
                className="w-full text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                    <i className={`fa-solid ${m.icon} text-white`}></i>
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">
                      {m.name}
                    </p>
                    <p className="mt-1 text-xs text-white/70">
                      {m.desc}
                    </p>
                  </div>

                  <i className="fa-solid fa-chevron-right text-white/40 mt-1"></i>
                </div>
              </button>

              {/* ACTION BUTTONS */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => navigate(`/modules/${m.slug}`)}
                  className="flex-1 rounded-xl bg-white px-3 py-2 text-xs font-medium text-black border"
                >
                  <i className="fa-solid fa-circle-info mr-1"></i>
                  Detail
                </button>

                <button
                  onClick={() => navigate(`/ajukan/${m.slug}`)}
                  className="flex-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-medium text-white"
                >
                  <i className="fa-solid fa-pen-to-square mr-1"></i>
                  Ajukan
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
