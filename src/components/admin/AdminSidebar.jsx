import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Swal from "sweetalert2";
import logo from "../../assets/logo.png";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  // ===== LOAD ROLE =====
  useEffect(() => {
    const loadRole = async () => {
      const { data: session } = await supabase.auth.getSession();
      const user = session?.session?.user;
      if (!user) return;

      const { data } = await supabase
        .from("admin_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setRole(data?.role);
    };

    loadRole();
  }, []);

  async function logout() {
    const result = await Swal.fire({
      title: 'Logout?',
      text: "Anda yakin ingin keluar dari sistem?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Logout',
      cancelButtonText: 'Batal',
    });

    if (!result.isConfirmed) return;

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
    <aside className="w-64 bg-white border-r flex flex-col h-screen">
      {/* ===== HEADER ===== */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <img src={logo} alt="Logo" className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Admin Panel</h1>
            <p className="text-xs text-gray-500">UWG System</p>
          </div>
        </div>
        
        {/* Role Indicator */}
        {role && (
          <div className="mt-2 text-xs">
            <span className={`px-2 py-1 rounded ${
              role === 'super' ? 'bg-purple-100 text-purple-700' :
              role === 'admin' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              <i className={`fas ${
                role === 'super' ? 'fa-crown' : 
                role === 'admin' ? 'fa-user-shield' : 'fa-user'
              } mr-1`}></i>
              {role}
            </span>
          </div>
        )}
      </div>

      {/* ===== NAV ===== */}
      <nav className="flex-1 p-4 space-y-1">
        <NavLink to="/admin/dashboard" className={linkClass}>
          <i className="fas fa-chart-bar"></i>
          <span>Dashboard</span>
        </NavLink>


        {/* ===== SUPER ADMIN ONLY ===== */}
        {role === "super" && (
          <>
            <div className="pt-2 mt-2 border-t">
              <p className="text-xs font-semibold text-gray-500 px-2 mb-2">Administrator</p>
              <NavLink to="/admin/manage-admin" className={linkClass}>
                <i className="fas fa-users-cog"></i>
                <span>Manajemen Admin</span>
              </NavLink>
            </div>
          </>
        )}
      </nav>

      {/* ===== FOOTER ===== */}
      <div className="p-4 border-t">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 rounded px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
        >
          <i className="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </button>
        <div className="mt-2 text-center text-xs text-gray-400">
          <p>v1.0 • UWG System</p>
        </div>
      </div>
    </aside>
  );
}