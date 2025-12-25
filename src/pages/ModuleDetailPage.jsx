import AppShell from "../components/AppShell";
import { useParams, useNavigate } from "react-router-dom";

/* Sementara hardcode
   NANTI bisa diganti dari Supabase */
const modules = [
  {
    name: "Keluhan Fasilitas",
    slug: "keluhan-fasilitas",
    icon: "fa-building-circle-exclamation",
    description:
      "Gunakan modul ini untuk melaporkan kerusakan fasilitas kampus seperti ruang kelas, toilet, AC, listrik, kebersihan, keamanan, dan sarana pendukung lainnya.",
    examples: [
      "AC rusak di ruang kelas",
      "Lampu mati di lorong",
      "Toilet tidak layak pakai",
    ],
  },
  {
    name: "Saran Akademik",
    slug: "saran-akademik",
    icon: "fa-graduation-cap",
    description:
      "Sampaikan saran atau masukan terkait kegiatan akademik seperti perkuliahan, jadwal, metode pembelajaran, dosen, atau kurikulum.",
    examples: [
      "Perubahan jadwal kuliah",
      "Metode pembelajaran kurang efektif",
      "Saran mata kuliah baru",
    ],
  },
  {
    name: "Administrasi",
    slug: "administrasi",
    icon: "fa-file-lines",
    description:
      "Gunakan modul ini untuk keperluan administrasi kampus seperti surat-menyurat, pelayanan TU, pembayaran, dan layanan administratif lainnya.",
    examples: [
      "Permohonan surat aktif kuliah",
      "Kendala pembayaran UKT",
      "Layanan TU lambat",
    ],
  },
];

export default function ModuleDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const module = modules.find((m) => m.slug === slug);

  if (!module) {
    return (
      <AppShell title="Modul Tidak Ditemukan">
        <p className="text-sm text-gray-500">
          Modul tidak tersedia.
        </p>
      </AppShell>
    );
  }

  return (
    <AppShell title={module.name}>
      {/* ===== HEADER ===== */}
      <section className="rounded-3xl bg-blue-900 text-white p-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
            <i className={`fa-solid ${module.icon} text-xl`}></i>
          </div>

          <div>
            <p className="text-lg font-semibold">{module.name}</p>
            <p className="text-xs text-white/70">
              Layanan resmi kampus
            </p>
          </div>
        </div>
      </section>

      {/* ===== DESKRIPSI ===== */}
      <section className="mt-4 rounded-3xl bg-white border p-4">
        <p className="text-sm font-semibold">Tentang layanan ini</p>
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
          {module.description}
        </p>
      </section>

      {/* ===== CONTOH ===== */}
      <section className="mt-4 rounded-3xl bg-white border p-4">
        <p className="text-sm font-semibold">
          Contoh pengajuan
        </p>

        <ul className="mt-2 space-y-2 text-sm text-gray-600">
          {module.examples.map((ex, i) => (
            <li key={i} className="flex items-start gap-2">
              <i className="fa-solid fa-check text-blue-600 mt-1 text-xs"></i>
              <span>{ex}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ===== PRIVASI ===== */}
      <section className="mt-4 rounded-3xl bg-blue-50 border border-blue-100 p-4">
        <p className="text-sm font-semibold text-blue-900">
          Privasi terjamin
        </p>
        <p className="mt-1 text-xs text-blue-800">
          Kamu tidak perlu login untuk mengajukan. Identitas aman dan
          hanya digunakan oleh admin terkait.
        </p>
      </section>

      {/* ===== CTA ===== */}
      <div className="mt-6">
        <button
          onClick={() => navigate(`/ajukan/${module.slug}`)}
          className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white active:scale-[0.98] transition"
        >
          <i className="fa-solid fa-pen-to-square mr-2"></i>
          Ajukan {module.name}
        </button>
      </div>
    </AppShell>
  );
}
