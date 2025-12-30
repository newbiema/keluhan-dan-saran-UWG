import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function AdminAuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        navigate("/admin/complete-profile", { replace: true });
      } else {
        navigate("/admin/login", { replace: true });
      }
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center text-sm">
      Memverifikasi undangan admin…
    </div>
  );
}
