import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function AdminSidebar() {
  const navigate = useNavigate();

  async function logout() {
    await supabase.auth.signOut();
    navigate("/admin/login");
  }

  return (
    <aside className="w-64 bg-white border-r flex flex-col">
      <div className="p-4 border-b">
        <h1 className="font-bold text-lg">Admin Panel</h1>
        <p className="text-xs text-gray-500">Keluhan & Saran</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `block rounded px-3 py-2 text-sm ${
              isActive
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-100"
            }`
          }
        >
          📋 Dashboard
        </NavLink>
      </nav>

      <div className="p-3 border-t">
        <button
          onClick={logout}
          className="w-full text-sm text-red-600 hover:bg-red-50 rounded px-3 py-2"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
