import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function RequireAdmin() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("loading");
  // loading | not-auth | not-admin | incomplete | allowed

  useEffect(() => {
    let mounted = true;

    async function checkAccess() {
      setLoading(true);

      // 1️⃣ Ambil session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        if (mounted) {
          setStatus("not-auth");
          setLoading(false);
        }
        return;
      }

      // 2️⃣ Ambil admin profile (WAJIB .single())
      const { data: profile, error } = await supabase
        .from("admin_profiles")
        .select("id, is_completed")
        .eq("id", session.user.id)
        .single();

      // ⛔ ERROR = bukan admin / RLS deny
      if (error || !profile) {
        if (mounted) {
          setStatus("not-admin");
          setLoading(false);
        }
        return;
      }

      // 3️⃣ Admin tapi belum complete profile
      if (!profile.is_completed) {
        if (mounted) {
          setStatus("incomplete");
          setLoading(false);
        }
        return;
      }

      // ✅ Semua OK
      if (mounted) {
        setStatus("allowed");
        setLoading(false);
      }
    }

    checkAccess();

    // 4️⃣ Listen auth change (PENTING)
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkAccess();
    });

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  /* ================= UI ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        Checking admin access…
      </div>
    );
  }

  if (status === "not-auth") {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (status === "incomplete") {
    return <Navigate to="/admin/complete-profile" replace />;
  }

  if (status === "not-admin") {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Akun ini bukan admin
      </div>
    );
  }

  return <Outlet />;
}
