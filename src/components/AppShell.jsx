import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo.png";

/* ================= NAV ITEM ================= */
function NavItem({ to, icon, label }) {
  const { pathname } = useLocation();
  const active = pathname === to;

  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center gap-1 text-xs ${
        active ? "text-white" : "text-white/60"
      }`}
    >
      <i className={`fa-solid ${icon} text-lg`}></i>
      <span className={active ? "font-semibold" : ""}>{label}</span>
    </Link>
  );
}

/* ================= APP SHELL ================= */
export default function AppShell({ title, children }) {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);

  const modules = [
    {
      name: "Keluhan Fasilitas",
      slug: "keluhan-fasilitas",
      icon: "fa-building-circle-exclamation",
    },
    {
      name: "Saran Akademik",
      slug: "saran-akademik",
      icon: "fa-graduation-cap",
    },
    {
      name: "Administrasi",
      slug: "administrasi",
      icon: "fa-file-lines",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ===== TOP BAR ===== */}
      <header className="sticky top-0 z-20 bg-blue-900 border-b border-white/10">
        <div className="mx-auto max-w-md px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 flex items-center justify-center">
                <img src={logo} alt="Logo" className="h-6 w-6" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="text-[11px] text-white/60">
                  Kampus • Keluhan & Saran
                </p>
              </div>
            </div>

            <Link
              to="/admin"
              className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-white"
            >
              <i className="fa-solid fa-shield-halved"></i>
            </Link>
          </div>
        </div>
      </header>

      {/* ===== PAGE CONTENT (ANIM READY) ===== */}
      <main className="mx-auto max-w-md px-4 pt-4 pb-28 transition-all duration-300">
        {children}
      </main>

      {/* ===== BOTTOM NAV ===== */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-blue-900 border-t border-white/10">
        <div className="mx-auto max-w-md px-6 py-3 grid grid-cols-3">
          <NavItem to="/" icon="fa-layer-group" label="Modul" />

          {/* BUAT (MODAL) */}
          <button
            onClick={() => setOpenModal(true)}
            className="flex flex-col items-center justify-center gap-1 text-xs text-white"
          >
            <i className="fa-solid fa-plus text-lg"></i>
            <span className="font-semibold">Buat</span>
          </button>

          <NavItem
            to="/cek-status"
            icon="fa-magnifying-glass"
            label="Status"
          />
        </div>
      </nav>

      {/* ===== MODAL PILIH MODUL ===== */}
      {openModal && (
        <div className="fixed inset-0 z-30 bg-black/40 flex items-end">
          <div className="w-full bg-white rounded-t-3xl p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-sm">Pilih Modul</p>
              <button onClick={() => setOpenModal(false)}>
                <i className="fa-solid fa-xmark text-gray-400"></i>
              </button>
            </div>

            <div className="space-y-2">
              {modules.map((m) => (
                <button
                  key={m.slug}
                  onClick={() => {
                    setOpenModal(false);
                    navigate(`/ajukan/${m.slug}`);
                  }}
                  className="w-full flex items-center gap-3 rounded-2xl border p-3 text-left active:scale-[0.98]"
                >
                  <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <i className={`fa-solid ${m.icon}`}></i>
                  </div>
                  <p className="text-sm font-medium">{m.name}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
