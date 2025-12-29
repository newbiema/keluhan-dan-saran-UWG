import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function AdminSidebar() {
  const navigate = useNavigate();

  async function logout() {
    await supabase.auth.signOut();
    navigate("/admin/login");
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded px-3 py-2 text-sm transition ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <aside className="w-64 bg-white border-r flex flex-col">
      {/* ===== HEADER ===== */}
      <div className="p-4 border-b">
        <h1 className="font-bold text-lg text-gray-900">
          Admin Panel
        </h1>
        <p className="text-xs text-gray-500">
          Keluhan & Saran Mahasiswa
        </p>
      </div>

      {/* ===== NAV ===== */}
      <nav className="flex-1 p-3 space-y-1">
        <NavLink to="/admin/dashboard" className={linkClass}>
          <i className="fa-solid fa-chart-line text-sm"></i>
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/admin/manage-admin" className={linkClass}>
          <i className="fa-solid fa-users-gear text-sm"></i>
          <span>Manajemen Admin</span>
        </NavLink>
      </nav>

      {/* ===== FOOTER ===== */}
      <div className="p-3 border-t">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 rounded px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
        >
          <i className="fa-solid fa-right-from-bracket"></i>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
