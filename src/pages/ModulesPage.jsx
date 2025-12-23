import AppShell from "../components/AppShell";

const modules = [
  {
    name: "Keluhan Fasilitas",
    desc: "Lapor kerusakan fasilitas kampus, kebersihan, keamanan, dll.",
    icon: "fa-building-circle-exclamation",
    color: "bg-white border-red-100",
  },
  {
    name: "Saran Akademik",
    desc: "Masukan untuk perkuliahan, jadwal, kurikulum, dosen, dll.",
    icon: "fa-graduation-cap",
    color: "bg-white border-blue-100",
  },
  {
    name: "Administrasi",
    desc: "Layanan TU, surat-menyurat, pembayaran, dan administrasi.",
    icon: "fa-file-lines",
    color: "bg-emerald-50 border-emerald-100",
  },
];

export default function ModulesPage() {
  return (
    <AppShell title="Layanan Mahasiswa" >
    
      {/* Banner */}
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

{/* Daftar Modul (panel biru sama kayak banner) */}
<section className="mt-4 rounded-3xl bg-[#1E3A8A] p-4">
  <div className="flex items-center justify-between">
    <p className="text-sm font-semibold text-white">Daftar Modul</p>
    <span className="text-xs text-white/70">{modules.length} modul</span>
  </div>

  <div className="mt-3 space-y-3">
    {modules.map((m) => (
      <button
        key={m.name}
className="w-full text-left rounded-3xl border border-white/15 bg-white/10 backdrop-blur p-4 active:scale-[0.99] transition"

        onClick={() => alert("Next: buka form pengajuan untuk " + m.name)}
      >
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
            <i className={`fa-solid ${m.icon} text-white`}></i>
          </div>

          <div className="flex-1">
            <p className="text-sm font-semibold text-white">{m.name}</p>
            <p className="mt-1 text-xs text-white/70">{m.desc}</p>

            <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-white">
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-black border">
                <i className="fa-solid fa-pen-to-square text-[11px]"></i>
                Ajukan
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-black border">
                <i className="fa-solid fa-arrow-right text-[11px]"></i>
                Detail
              </span>
            </div>
          </div>

          <i className="fa-solid fa-chevron-right text-white/50 mt-1"></i>
        </div>
      </button>
    ))}
  </div>
</section>

    </AppShell>
  );
}
