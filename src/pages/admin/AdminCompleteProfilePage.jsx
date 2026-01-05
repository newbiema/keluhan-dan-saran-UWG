import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Swal from "sweetalert2";

export default function AdminCompleteProfilePage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [userId, setUserId] = useState(null);

  /* ================= CHECK SESSION ================= */
  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;

      if (!session) {
        navigate("/admin/login", { replace: true });
        return;
      }

      setUserId(session.user.id);

      // cek apakah sudah complete
      const { data: profile } = await supabase
        .from("admin_profiles")
        .select("is_completed")
        .eq("id", session.user.id)
        .single();

      if (profile?.is_completed) {
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      setLoading(false);
    }

    init();
  }, [navigate]);

  /* ================= SUBMIT ================= */
  async function submit(e) {
    e.preventDefault();

    if (!name.trim()) {
      Swal.fire("Error", "Nama wajib diisi", "error");
      return;
    }

    if (password.length < 6) {
      Swal.fire("Error", "Password minimal 6 karakter", "error");
      return;
    }

    if (password !== confirm) {
      Swal.fire("Error", "Konfirmasi password tidak sama", "error");
      return;
    }

    setSaving(true);

    // 1️⃣ set password di Supabase Auth
    const { error: authError } = await supabase.auth.updateUser({
      password,
    });

    if (authError) {
      setSaving(false);
      Swal.fire("Gagal", authError.message, "error");
      return;
    }

    // 2️⃣ update profile admin
    const { error: profileError } = await supabase
      .from("admin_profiles")
      .update({
        name,
        is_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    setSaving(false);

    if (profileError) {
      Swal.fire("Gagal", profileError.message, "error");
      return;
    }

    Swal.fire({
      icon: "success",
      title: "Profil selesai",
      text: "Akun admin siap digunakan",
      timer: 1500,
      showConfirmButton: false,
    });

    navigate("/admin/dashboard", { replace: true });
  }

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Menyiapkan akun admin…
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-white border rounded-xl p-6 space-y-4 shadow-sm"
      >
        <div className="text-center">
          <h1 className="text-xl font-bold">Lengkapi Profil Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Buat password dan isi nama untuk melanjutkan
          </p>
        </div>

        {/* Nama */}
        <div>
          <label className="text-xs text-gray-500">Nama</label>
          <div className="mt-1 flex items-center gap-2 border rounded-lg px-3 py-2">
            <i className="fa-solid fa-user text-gray-400"></i>
            <input
              className="w-full outline-none text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama admin"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="text-xs text-gray-500">Password</label>
          <div className="mt-1 flex items-center gap-2 border rounded-lg px-3 py-2">
            <i className="fa-solid fa-lock text-gray-400"></i>
            <input
              type="password"
              className="w-full outline-none text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              required
            />
          </div>
        </div>

        {/* Confirm */}
        <div>
          <label className="text-xs text-gray-500">
            Konfirmasi Password
          </label>
          <div className="mt-1 flex items-center gap-2 border rounded-lg px-3 py-2">
            <i className="fa-solid fa-lock-keyhole text-gray-400"></i>
            <input
              type="password"
              className="w-full outline-none text-sm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Ulangi password"
              required
            />
          </div>
        </div>

        <button
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          <i className="fa-solid fa-check"></i>
          {saving ? "Menyimpan..." : "Simpan & Masuk Dashboard"}
        </button>
      </form>
    </div>
  );
}
