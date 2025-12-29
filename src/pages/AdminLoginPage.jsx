import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import { supabase } from "../lib/supabase";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) return alert(error.message);

    nav("/admin/dashboard");
  }

  const disabled = !email.trim() || password.length < 6;

  return (
    <AppShell title="Admin Login">
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

          <button
            disabled={disabled || loading}
            className={`w-full rounded-2xl py-3 text-sm font-semibold active:scale-[0.99] transition ${
              disabled || loading ? "bg-gray-200 text-gray-500" : "bg-black text-white"
            }`}
          >
            <i className="fa-solid fa-right-to-bracket mr-2"></i>
            {loading ? "Loading..." : "Login"}
          </button>

          <div className="flex items-center justify-between text-xs">
            <Link to="/admin/forgot" className="text-gray-600 underline underline-offset-4">
              Lupa password?
            </Link>
            {/* <Link to="/admin/register" className="text-gray-900 font-semibold underline underline-offset-4">
              Register admin
            </Link> */}
          </div>
        </form>
      </section>
    </AppShell>
  );
}
