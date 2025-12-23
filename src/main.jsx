import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import ModulesPage from "./pages/ModulesPage";
import CheckStatusPage from "./pages/CheckStatusPage";
import AdminPage from "./pages/AdminPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminRegisterPage from "./pages/AdminRegisterPage";
// import logo from "./assets/logo.png";
import AdminForgotPasswordPage from "./pages/AdminForgotPasswordPage";

import AdminChangePasswordPage from "./pages/AdminChangePasswordPage";



ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ModulesPage />} />
        <Route path="/cek-status" element={<CheckStatusPage />} />


        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

        <Route path="/admin/register" element={<AdminRegisterPage />} />
        <Route path="/admin/forgot" element={<AdminForgotPasswordPage />} />
        





      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
