import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { supabase } from "../lib/supabase";


export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  

  const emailError = useMemo(() => {
    if (!email) return "Email wajib diisi";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Format email tidak valid";
    return "";
  }, [email]);

  async function onSubmit(e) {
    e.preventDefault();
    if (emailError) return;

    const redirectTo = `${window.location.origin}/admin/reset`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) return alert(error.message);

    setSent(true);
  }


  return (
    <AppShell title="Lupa Password">
      {!sent ? (
        <section className="rounded-3xl border bg-white p-4">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-2xl bg-black text-white flex items-center justify-center">
              <i className="fa-solid fa-unlock-keyhole text-lg"></i>
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold">Reset Password</p>
              <p className="mt-1 text-xs text-gray-500">
                Masukkan email admin. Kami kirim link reset ke email kamu.
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
              {emailError && <p className="mt-1 text-xs text-red-600">{emailError}</p>}
            </label>

            <button
              disabled={!!emailError}
              className={`w-full rounded-2xl py-3 text-sm font-semibold active:scale-[0.99] transition ${
                emailError ? "bg-gray-200 text-gray-500" : "bg-black text-white"
              }`}
            >
              <i className="fa-solid fa-paper-plane mr-2"></i>
              Kirim Link Reset
            </button>

            <p className="text-center text-xs text-gray-600">
              Ingat password?{" "}
              <Link
                to="/admin/login"
                className="font-semibold underline underline-offset-4 text-gray-900"
              >
                Kembali ke Login
              </Link>
            </p>
          </form>
        </section>
      ) : (
        <section className="rounded-3xl border bg-white p-4">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-2xl bg-green-600 text-white flex items-center justify-center">
              <i className="fa-solid fa-circle-check text-lg"></i>
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold">Link Terkirim</p>
              <p className="mt-1 text-xs text-gray-500">
                Kami sudah kirim link reset password ke:
              </p>
              <p className="mt-2 rounded-2xl border bg-gray-50 px-3 py-2 text-sm font-semibold">
                {email}
              </p>

              <div className="mt-3 rounded-2xl bg-gray-50 border p-3 text-xs text-gray-600">
                <p className="font-semibold text-gray-800">Tips:</p>
                <ul className="mt-1 list-disc pl-4 space-y-1">
                  <li>Cek folder Spam/Promotions.</li>
                  <li>Tunggu 1–3 menit lalu refresh inbox.</li>
                  <li>Pastikan email yang dimasukkan benar.</li>
                </ul>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSent(false)}
                  className="rounded-2xl border py-3 text-sm font-semibold active:scale-[0.99] transition"
                >
                  <i className="fa-solid fa-rotate-right mr-2"></i>
                  Kirim Ulang
                </button>
                <Link
                  to="/admin/login"
                  className="rounded-2xl bg-black py-3 text-center text-sm font-semibold text-white active:scale-[0.99] transition"
                >
                  <i className="fa-solid fa-right-to-bracket mr-2"></i>
                  Login
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="mt-4 rounded-3xl border bg-white p-4">
        <div className="flex items-start gap-3">
          <i className="fa-solid fa-circle-info text-gray-700 mt-0.5"></i>
          <p className="text-xs text-gray-600">
            Link reset hanya berlaku sementara. Setelah reset, kamu bisa login dengan password baru.
          </p>
        </div>
      </section>
    </AppShell>
  );
}
