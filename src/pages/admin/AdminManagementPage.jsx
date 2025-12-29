import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("operator");
  const [loading, setLoading] = useState(false);

  async function loadAdmins() {
    const { data } = await supabase
      .from("admin_profiles")
      .select("id,email,role,created_at")
      .order("created_at", { ascending: false });

    setAdmins(data || []);
  }

  useEffect(() => {
    loadAdmins();
  }, []);

  async function addAdmin() {
    if (!email) return alert("Email wajib diisi");
    setLoading(true);

    /**
     * CATATAN PENTING:
     * Untuk production seharusnya via Edge Function (service role)
     * Untuk tugas kampus: admin dibuat dulu via Supabase Dashboard
     */
    const { data: users } = await supabase
      .from("auth.users")
      .select("id")
      .eq("email", email)
      .single();

    if (!users) {
      alert("User belum ada di Supabase Auth");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("admin_profiles").insert({
      id: users.id,
      email,
      role,
    });

    if (error) {
      alert(error.message);
    } else {
      setEmail("");
      loadAdmins();
    }

    setLoading(false);
  }

  async function removeAdmin(id) {
    if (!confirm("Hapus admin ini?")) return;

    await supabase.from("admin_profiles").delete().eq("id", id);
    loadAdmins();
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* ===== HEADER ===== */}
      <div>
        <h1 className="text-xl font-bold">Manajemen Admin</h1>
        <p className="text-sm text-muted-foreground">
          Kelola akun admin sistem
        </p>
      </div>

      {/* ===== ADD ADMIN ===== */}
      <div className="bg-white border rounded-lg p-4 space-y-3">
        <p className="font-semibold text-sm">Tambah Admin</p>

        <input
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Email admin"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <select
          className="w-full border rounded px-3 py-2 text-sm"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="operator">Operator</option>
          <option value="super">Super Admin</option>
        </select>

        <button
          onClick={addAdmin}
          disabled={loading}
          className="bg-blue-600 text-white rounded px-4 py-2 text-sm"
        >
          {loading ? "Menyimpan..." : "Tambah Admin"}
        </button>
      </div>

      {/* ===== LIST ADMIN ===== */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-3">{a.email}</td>
                <td className="p-3">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      a.role === "super"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {a.role}
                  </span>
                </td>
                <td className="p-3">
                  {a.role !== "super" && (
                    <button
                      onClick={() => removeAdmin(a.id)}
                      className="text-red-600 text-xs"
                    >
                      Hapus
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr>
                <td colSpan="3" className="p-4 text-center text-gray-500">
                  Belum ada admin
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
