import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function AdminAuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    async function handleInvite() {
      // Supabase otomatis parse token dari URL
      const { data, error } = await supabase.auth.getSession();

      if (error || !data?.session) {
        navigate("/admin/login", { replace: true });
        return;
      }

      // Cek apakah admin sudah punya profile lengkap
      const { data: profile } = await supabase
        .from("admin_profiles")
        .select("role, name")
        .eq("id", data.session.user.id)
        .single();

      if (!profile?.name) {
        navigate("/admin/complete-profile", { replace: true });
      } else {
        navigate("/admin/dashboard", { replace: true });
      }
    }

    handleInvite();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
      Menyiapkan akun admin…
    </div>
  );
}
