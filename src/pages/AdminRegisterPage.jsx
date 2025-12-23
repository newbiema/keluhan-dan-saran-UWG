import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";

export default function AdminRegisterPage() {
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);

  const errors = useMemo(() => {
    const e = {};
    if (name.trim().length < 3) e.name = "Nama minimal 3 karakter";
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Email tidak valid";
    if (phone.trim().length < 8) e.phone = "Nomor HP minimal 8 digit";
    if (password.length < 6) e.password = "Password minimal 6 karakter";
    if (confirm !== password) e.confirm = "Konfirmasi password tidak sama";
    return e;
  }, [name, email, phone, password, confirm]);

  const canSubmit = Object.keys(errors).length === 0;

  function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    // nanti connect ke Supabase Auth / API
    alert("Register clicked (UI dulu).");
    nav("/admin/login");
  }

  return (
    <AppShell title="Register Admin">
      <section className="rounded-3xl border bg-white p-4">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-2xl bg-black text-white flex items-center justify-center">
            <i className="fa-solid fa-user-shield text-lg"></i>
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold">Buat Akun Admin</p>
            <p className="mt-1 text-xs text-gray-500">
              Gunakan data resmi. Akun admin dipakai untuk mengelola pengajuan & status.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          {/* Nama */}
          <div>
            <label className="text-xs text-gray-600">Nama Admin</label>
            <div className="mt-1 flex items-center gap-2 rounded-2xl border bg-gray-50 px-3 py-2">
              <i className="fa-solid fa-id-badge text-gray-400"></i>
              <input
                className="w-full bg-transparent outline-none text-sm"
                placeholder="Contoh: Budi Santoso"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="text-xs text-gray-600">Email</label>
            <div className="mt-1 flex items-center gap-2 rounded-2xl border bg-gray-50 px-3 py-2">
              <i className="fa-solid fa-envelope text-gray-400"></i>
              <input
                type="email"
                className="w-full bg-transparent outline-none text-sm"
                placeholder="admin@kampus.ac.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          {/* HP */}
          <div>
            <label className="text-xs text-gray-600">Nomor HP</label>
            <div className="mt-1 flex items-center gap-2 rounded-2xl border bg-gray-50 px-3 py-2">
              <i className="fa-solid fa-phone text-gray-400"></i>
              <input
                className="w-full bg-transparent outline-none text-sm"
                placeholder="08xxxxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="numeric"
              />
            </div>
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="text-xs text-gray-600">Password</label>
            <div className="mt-1 flex items-center gap-2 rounded-2xl border bg-gray-50 px-3 py-2">
              <i className="fa-solid fa-lock text-gray-400"></i>
              <input
                type={showPw ? "text" : "password"}
                className="w-full bg-transparent outline-none text-sm"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="h-8 w-8 rounded-xl border bg-white flex items-center justify-center"
                aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}
              >
                <i className={`fa-solid ${showPw ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>

          {/* Confirm */}
          <div>
            <label className="text-xs text-gray-600">Konfirmasi Password</label>
            <div className="mt-1 flex items-center gap-2 rounded-2xl border bg-gray-50 px-3 py-2">
              <i className="fa-solid fa-key text-gray-400"></i>
              <input
                type={showPw ? "text" : "password"}
                className="w-full bg-transparent outline-none text-sm"
                placeholder="Ulangi password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            {errors.confirm && <p className="mt-1 text-xs text-red-600">{errors.confirm}</p>}
          </div>

          <button
            disabled={!canSubmit}
            className={`w-full rounded-2xl py-3 text-sm font-semibold active:scale-[0.99] transition ${
              canSubmit ? "bg-black text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            <i className="fa-solid fa-user-plus mr-2"></i>
            Register
          </button>

          <p className="text-center text-xs text-gray-600">
            Sudah punya akun?{" "}
            <Link to="/admin/login" className="font-semibold underline underline-offset-4 text-gray-900">
              Login
            </Link>
          </p>
        </form>
      </section>

      <section className="mt-4 rounded-3xl border bg-white p-4">
        <div className="flex items-start gap-3">
          <i className="fa-solid fa-circle-info text-gray-700 mt-0.5"></i>
          <p className="text-xs text-gray-600">
            Pastikan email & nomor HP aktif. Password minimal 6 karakter.
          </p>
        </div>
      </section>
    </AppShell>
  );
}
