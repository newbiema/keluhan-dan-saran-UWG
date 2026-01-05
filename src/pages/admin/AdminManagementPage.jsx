import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Swal from "sweetalert2";

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("operator");
  const [loading, setLoading] = useState(false);
  const [myRole, setMyRole] = useState(null);

  /* ================= LOAD ROLE SAYA ================= */
  async function loadMyRole() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("admin_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    setMyRole(data?.role ?? null);
  }

  /* ================= LOAD ADMIN (RLS-AWARE) ================= */
  async function loadAdmins() {
    const { data, error } = await supabase
      .from("admin_profiles")
      .select("id,email,role,is_completed,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setAdmins(data || []);
  }

  useEffect(() => {
    loadMyRole();
    loadAdmins();
  }, []);

  /* ================= INVITE ADMIN ================= */
  async function addAdmin() {
    if (!email.trim()) {
      Swal.fire("Error", "Email wajib diisi", "error");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke(
        "create-admin",
        {
          body: {
            email: email.trim().toLowerCase(),
            role,
          },
        }
      );

      if (error) throw error;

      Swal.fire("Berhasil", "Undangan admin terkirim", "success");
      setEmail("");
      setRole("operator");
      loadAdmins();
    } catch (err) {
      Swal.fire("Gagal", err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  /* ================= UI ================= */
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Manajemen Admin</h1>

      {/* FORM INVITE (SUPER ONLY) */}
      {myRole === "super" && (
        <div className="bg-white border rounded p-4 space-y-3">
          <input
            type="email"
            className="w-full border px-3 py-2"
            placeholder="Email admin"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <select
            className="w-full border px-3 py-2"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="operator">Operator</option>
            <option value="super">Super Admin</option>
          </select>

          <button
            onClick={addAdmin}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Mengirim..." : "Kirim Undangan"}
          </button>
        </div>
      )}

      {/* LIST ADMIN */}
      <div className="bg-white border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-3">{a.email}</td>
                <td className="p-3 capitalize">{a.role}</td>
                <td className="p-3">
                  {a.is_completed ? "Aktif" : "Menunggu"}
                </td>
              </tr>
            ))}

            {admins.length === 0 && (
              <tr>
                <td colSpan="3" className="p-4 text-center text-gray-400">
                  Tidak ada data admin
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">
        Login sebagai: <b>{myRole}</b>
      </p>
    </div>
  );
}
