import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Swal from "sweetalert2";

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("operator");
  const [loading, setLoading] = useState(false);
  const [myRole, setMyRole] = useState(null);

  /* ================= LOAD ADMIN LIST ================= */
  async function loadAdmins() {
    const { data } = await supabase
      .from("admin_profiles")
      .select("id,email,role,created_at")
      .order("created_at", { ascending: false });

    setAdmins(data || []);
  }

  /* ================= LOAD MY ROLE ================= */
  async function loadMyRole() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return;

    const { data } = await supabase
      .from("admin_profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single();

    setMyRole(data?.role ?? null);
  }

  useEffect(() => {
    loadAdmins();
    loadMyRole();
  }, []);

  /* ================= ADD ADMIN ================= */
  async function addAdmin() {
    if (!email) {
      Swal.fire("Error", "Email wajib diisi", "error");
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Session admin tidak ditemukan");
      }

      // Memanggil Edge Function
      const { data, error } = await supabase.functions.invoke(
        "create-admin",
        {
          body: { email, role },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      // Jika ada error dari pemanggilan fungsi (400, 401, 500)
      if (error) {
        // Supabase Edge Function biasanya mengembalikan error dalam bentuk JSON
        // Kita coba ambil pesan error dari body jika tersedia
        const errorMsg = error instanceof Error ? error.message : "Gagal memproses permintaan";
        throw new Error(errorMsg);
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Undangan admin berhasil dikirim",
      });

      setEmail("");
      setRole("operator");
      loadAdmins();
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", err.message, "error");
    } finally {
      setLoading(false);
    }
  }
  /* ================= REMOVE ADMIN ================= */
  async function removeAdmin(id) {
    const confirm = await Swal.fire({
      title: "Hapus admin?",
      text: "Admin ini akan kehilangan akses dashboard",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
    });

    if (!confirm.isConfirmed) return;

    await supabase.from("admin_profiles").delete().eq("id", id);

    Swal.fire("Terhapus", "Admin berhasil dihapus", "success");
    loadAdmins();
  }

  /* ================= RENDER ================= */
  return (
    <div className="space-y-6 max-w-3xl">
      {/* ===== HEADER ===== */}
      <div>
        <h1 className="text-xl font-bold">Manajemen Admin</h1>
        <p className="text-sm text-muted-foreground">
          Kelola akun admin sistem
        </p>
      </div>

      {/* ===== ADD ADMIN (SUPER ONLY) ===== */}
      {myRole === "super" && (
        <div className="bg-white border rounded-lg p-4 space-y-4">
          <p className="font-semibold text-sm">Tambah Admin</p>

          <input
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Email admin"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <select
            className="w-full border rounded px-3 py-2 text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
          >
            <option value="operator">Operator</option>
            <option value="super">Super Admin</option>
          </select>

          <button
            onClick={addAdmin}
            disabled={loading}
            className="bg-blue-600 text-white rounded px-4 py-2 text-sm disabled:opacity-60"
          >
            {loading ? "Mengirim undangan..." : "Tambah Admin"}
          </button>
        </div>
      )}

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
                  {myRole === "super" && a.role !== "super" ? (
                    <button
                      onClick={() => removeAdmin(a.id)}
                      className="text-red-600 text-xs"
                    >
                      Hapus
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
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
