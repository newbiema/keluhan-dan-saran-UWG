import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* ===== MAHASISWA ===== */
import ModulesPage from "./pages/ModulesPage";
import ModuleDetailPage from "./pages/ModuleDetailPage";
import SubmitPage from "./pages/SubmitPage";
import CheckStatusPage from "./pages/CheckStatusPage";

/* ===== ADMIN AUTH & LANDING ===== */
import AdminPage from "./pages/AdminPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminRegisterPage from "./pages/AdminRegisterPage";
import AdminForgotPasswordPage from "./pages/AdminForgotPasswordPage";
import AdminResetCallbackPage from "./pages/AdminResetCallbackPage";
import AdminChangePasswordPage from "./pages/AdminChangePasswordPage";

/* ===== ADMIN CORE ===== */
import RequireAdmin from "./components/RequireAdmin";
import AdminLayout from "./pages/admin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import SubmissionDetailPage from "./pages/admin/SubmissionDetailPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= MAHASISWA ================= */}
        <Route path="/" element={<ModulesPage />} />
        <Route path="/modules/:slug" element={<ModuleDetailPage />} />
        <Route path="/ajukan/:slug" element={<SubmitPage />} />
        <Route path="/cek-status" element={<CheckStatusPage />} />

        {/* ================= ADMIN LANDING ================= */}
        <Route path="/admin" element={<AdminPage />} />

        {/* ================= ADMIN AUTH ================= */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/register" element={<AdminRegisterPage />} />
        <Route path="/admin/forgot" element={<AdminForgotPasswordPage />} />
        <Route path="/admin/reset" element={<AdminResetCallbackPage />} />
        <Route path="/admin/change-password" element={<AdminChangePasswordPage />} />

        {/* ================= ADMIN DASHBOARD (PROTECTED) ================= */}
        <Route path="/admin" element={<RequireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="submissions/:id" element={<SubmissionDetailPage />} />
          </Route>
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
