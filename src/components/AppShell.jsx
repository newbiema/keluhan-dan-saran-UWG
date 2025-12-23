import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

function NavItem({ to, icon, label }) {
  const { pathname } = useLocation();
  const active = pathname === to;

  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center gap-1 text-xs ${
        active ? "text-white" : "text-gray-500"
      }`}
    >
      <i className={`fa-solid ${icon} text-lg`}></i>
      <span className={`${active ? "font-semibold" : ""}`}>{label}</span>
    </Link>
  );
}

export default function AppShell({ title, children }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-10 bg-blue-900 backdrop-blur border-b">
        <div className="mx-auto max-w-md px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 text-white flex items-center justify-center">

                <img src={logo} alt="Logo" className="h-5 w-5" />
              </div>
              <div className="leading-tight">
                <p className="text-sm text-white font-semibold">{title}</p>
            
                <p className="text-[11px] text-gray-500">Kampus • Keluhan & Saran</p>
              </div>
            </div>

            <button className="h-9 w-9  bg- flex items-center justify-center">
              <i className="fa-solid fa-bell text-white"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-md bg-white px-4 pt-4 pb-24">{children}</main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 border-t bg-blue-900">
        <div className="mx-auto max-w-md px-6 py-3 grid grid-cols-3">
          <NavItem to="/" icon="fa-layer-group" label="Modul" />
          <NavItem to="/cek-status" icon="fa-magnifying-glass" label="Status" />
          <NavItem to="/admin" icon="fa-shield-halved" label="Admin" />
        </div>
      </nav>
    </div>
  );
}
