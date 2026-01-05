import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* ===== MAHASISWA ===== */
import ModulesPage from "./pages/ModulesPage";
import ModuleDetailPage from "./pages/ModuleDetailPage";
import SubmitPage from "./pages/SubmitPage";
import CheckStatusPage from "./pages/CheckStatusPage";

/* ===== ADMIN PUBLIC ===== */
import AdminPage from "./pages/AdminPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminForgotPasswordPage from "./pages/AdminForgotPasswordPage";
import AdminResetCallbackPage from "./pages/AdminResetCallbackPage";
import AdminChangePasswordPage from "./pages/AdminChangePasswordPage";

/* ===== ADMIN INVITE FLOW (Update path import jika perlu) ===== */
import AdminAuthCallbackPage from "./pages/admin/AdminAuthCallbackPage";
import AdminCompleteProfilePage from "./pages/admin/AdminCompleteProfilePage";

/* ===== ADMIN CORE ===== */
import RequireAdmin from "./components/RequireAdmin";
import AdminLayout from "./pages/admin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import SubmissionDetailPage from "./pages/admin/SubmissionDetailPage";
import AdminManagementPage from "./pages/admin/AdminManagementPage";



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ===== MAHASISWA ===== */}
        <Route path="/" element={<ModulesPage />} />
        <Route path="/modules/:slug" element={<ModuleDetailPage />} />
        <Route path="/ajukan/:slug" element={<SubmitPage />} />
        <Route path="/cek-status" element={<CheckStatusPage />} />

        {/* ===== ADMIN PUBLIC & AUTH ===== */}
        {/* Ubah path utama admin agar tidak bentrok dengan wrapper RequireAdmin */}
        <Route path="/admin-portal" element={<AdminPage />} /> 
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/forgot" element={<AdminForgotPasswordPage />} />
        <Route path="/admin/reset" element={<AdminResetCallbackPage />} />
        <Route path="/admin/change-password" element={<AdminChangePasswordPage />} />

        {/* ===== ADMIN INVITE FLOW ===== */}
        {/* Pastikan link di email Supabase diarahkan ke sini */}
        <Route path="/admin/callback" element={<AdminAuthCallbackPage />} />
        <Route
          path="/admin/complete-profile"
          element={<AdminCompleteProfilePage />}
        />

        {/* ===== ADMIN PROTECTED (DASHBOARD) ===== */}
        {/* Menggunakan satu root /admin untuk semua halaman terproteksi */}
        <Route path="/admin" element={<RequireAdmin />}>
          <Route element={<AdminLayout />}>
            {/* Halaman utama saat buka /admin */}
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="submissions/:id" element={<SubmissionDetailPage />} />
            <Route path="manage-admin" element={<AdminManagementPage />} />
          </Route>
        </Route>

        {/* ===== FALLBACK ===== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}