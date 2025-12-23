import { useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  function onSubmit(e) {
    e.preventDefault();
    // Nanti kita sambungkan ke Supabase Auth / API
    alert("Login clicked (UI dulu).");
  }

  const disabled = !email.trim() || password.length < 6;

  return (
    <AppShell title="Admin Login">
      {/* Card */}
      <section className="rounded-3xl border bg-white p-4">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-2xl bg-black text-white flex items-center justify-center">
            <i className="fa-solid fa-shield-halved text-lg"></i>
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold">Masuk Admin</p>
            <p className="mt-1 text-xs text-gray-500">
              Dashboard admin hanya untuk petugas/pegawai kampus.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          {/* Email */}
          <label className="block">
            <span className="text-xs text-gray-600">Email</span>
            <div className="mt-1 flex items-center gap-2 rounded-2xl border bg-gray-50 px-3 py-2">
              <i className="fa-solid fa-envelope text-gray-400"></i>
              <input
                type="email"
                className="w-full bg-transparent outline-none text-sm"
                placeholder="admin@kampus.ac.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </label>

          {/* Password */}
          <label className="block">
            <span className="text-xs text-gray-600">Password</span>
            <div className="mt-1 flex items-center gap-2 rounded-2xl border bg-gray-50 px-3 py-2">
              <i className="fa-solid fa-lock text-gray-400"></i>
              <input
                type={showPw ? "text" : "password"}
                className="w-full bg-transparent outline-none text-sm"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                minLength={6}
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
          </label>

          {/* Actions */}
          <button
            disabled={disabled}
            className={`w-full rounded-2xl py-3 text-sm font-semibold active:scale-[0.99] transition ${
              disabled ? "bg-gray-200 text-gray-500" : "bg-black text-white"
            }`}
          >
            <i className="fa-solid fa-right-to-bracket mr-2"></i>
            Login
          </button>

          <div className="flex items-center justify-between text-xs">
            <Link to="/admin/forgot" className="text-gray-600 underline underline-offset-4">
              Lupa password?
            </Link>
            <Link to="/admin/register" className="text-gray-900 font-semibold underline underline-offset-4">
              Register admin
            </Link>
          </div>
        </form>
      </section>

      {/* Help / note */}
      <section className="mt-4 rounded-3xl border bg-white p-4">
        <div className="flex items-start gap-3">
          <i className="fa-solid fa-circle-info text-gray-700 mt-0.5"></i>
          <p className="text-xs text-gray-600">
            Gunakan email resmi. Jika belum punya akun, pilih <b>Register admin</b>.
          </p>
        </div>
      </section>
    </AppShell>
  );
}
