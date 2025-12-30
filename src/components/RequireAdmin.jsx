import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function RequireAdmin() {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    async function checkAdmin() {
      // 1️⃣ cek session
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (!session) {
        if (mounted) {
          setAllowed(false);
          setLoading(false);
        }
        return;
      }

      // 2️⃣ cek admin_profiles
      const { data: profile } = await supabase
        .from("admin_profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (mounted) {
        setAllowed(!!profile); // hanya admin terdaftar
        setLoading(false);
      }
      
    }

    checkAdmin();

    // optional: listen auth change
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      checkAdmin();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // ===== LOADING =====
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Checking admin access…
      </div>
    );
  }

  // ===== NOT ADMIN =====
  if (!allowed) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // ===== OK =====
  return <Outlet />;
}
