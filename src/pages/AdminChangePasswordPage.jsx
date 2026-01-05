import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { supabase } from "../lib/supabase";


export default function AdminChangePasswordPage() {
  const [currentPw, ] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [done, setDone] = useState(false);

  const errors = useMemo(() => {
    const e = {};
    if (newPw.length < 6) e.newPw = "Password baru minimal 6 karakter";
    if (confirmPw !== newPw) e.confirmPw = "Konfirmasi password tidak sama";
    if (newPw && currentPw && newPw === currentPw) e.newPw = "Password baru harus berbeda";
    return e;
  }, [currentPw, newPw, confirmPw]);

  const canSubmit = Object.keys(errors).length === 0 && newPw && confirmPw;

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) return alert(error.message);

    setDone(true);
  }


  return (
    <AppShell title="Ganti Password">
      {!done ? (
        <section className="rounded-3xl border bg-white p-4">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-2xl bg-black text-white flex items-center justify-center">
              <i className="fa-solid fa-key text-lg"></i>
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold">Ganti Password</p>
              <p className="mt-1 text-xs text-gray-500">
                Buat password baru untuk akun admin kamu.
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            {/* Current password (opsional) */}

            {/* New password */}
            <div>
              <label className="text-xs text-gray-600">Password Baru</label>
              <div className="mt-1 flex items-center gap-2 rounded-2xl border bg-gray-50 px-3 py-2">
                <i className="fa-solid fa-key text-gray-400"></i>
                <input
                  type={showPw ? "text" : "password"}
                  className="w-full bg-transparent outline-none text-sm"
                  placeholder="Minimal 6 karakter"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  required
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
              {errors.newPw && <p className="mt-1 text-xs text-red-600">{errors.newPw}</p>}
            </div>

            {/* Confirm */}
            <div>
              <label className="text-xs text-gray-600">Konfirmasi Password Baru</label>
              <div className="mt-1 flex items-center gap-2 rounded-2xl border bg-gray-50 px-3 py-2">
                <i className="fa-solid fa-check text-gray-400"></i>
                <input
                  type={showPw ? "text" : "password"}
                  className="w-full bg-transparent outline-none text-sm"
                  placeholder="Ulangi password baru"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              {errors.confirmPw && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmPw}</p>
              )}
            </div>

            <button
              disabled={!canSubmit}
              className={`w-full rounded-2xl py-3 text-sm font-semibold active:scale-[0.99] transition ${
                canSubmit ? "bg-black text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              <i className="fa-solid fa-floppy-disk mr-2"></i>
              Simpan Password
            </button>

            <p className="text-center text-xs text-gray-600">
              Kembali ke{" "}
              <Link to="/admin/login" className="font-semibold underline underline-offset-4 text-gray-900">
                Login
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
              <p className="text-base font-semibold">Berhasil</p>
              <p className="mt-1 text-xs text-gray-500">
                Password admin sudah diperbarui. Silakan login kembali.
              </p>

              <Link
                to="/admin/login"
                className="mt-4 block w-full rounded-2xl bg-black py-3 text-center text-sm font-semibold text-white active:scale-[0.99] transition"
              >
                <i className="fa-solid fa-right-to-bracket mr-2"></i>
                Login Sekarang
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="mt-4 rounded-3xl border bg-white p-4">
        <div className="flex items-start gap-3">
          <i className="fa-solid fa-circle-info text-gray-700 mt-0.5"></i>
          <p className="text-xs text-gray-600">
            Tips aman: gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol.
          </p>
        </div>
      </section>
    </AppShell>
  );
}
