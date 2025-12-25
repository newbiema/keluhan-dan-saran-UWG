import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import { supabase } from "../lib/supabase";

export default function AdminResetCallbackPage() {
  const nav = useNavigate();
  const [msg, setMsg] = useState("Memproses link reset...");

  useEffect(() => {
    (async () => {
      // Supabase bisa kirim "code" (PKCE) atau token di hash tergantung setting
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          // kalau mode hash token, supabase-js biasanya auto handle saat getSession
          await supabase.auth.getSession();
        }

        setMsg("Berhasil. Silakan buat password baru.");
        nav("/admin/change-password", { replace: true });
      } catch (e) {
        setMsg("Link reset tidak valid / sudah expired.");
      }
    })();
  }, [nav]);

  return (
    <AppShell title="Reset Password">
      <section className="rounded-3xl border bg-white p-4">
        <p className="text-sm font-semibold">{msg}</p>
        <p className="mt-2 text-xs text-gray-500">
          Jika gagal, coba kirim ulang reset password dari halaman login.
        </p>
      </section>
    </AppShell>
  );
}
