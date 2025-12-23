import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";

export default function AdminPage() {
  return (
    <AppShell title="Admin">
      <section className="rounded-3xl border bg-white p-4">
        <p className="text-sm font-semibold">Admin Dashboard</p>
        <p className="mt-1 text-xs text-gray-500">
          Login untuk mengelola modul, pengajuan, dan status layanan.
        </p>

        <Link
          to="/admin/login"
          className="mt-4 block w-full rounded-2xl border py-3 text-center text-sm font-semibold active:scale-[0.99] transition"
        >
          <i className="fa-solid fa-right-to-bracket mr-2"></i>
          Login Admin
        </Link>
      </section>
    </AppShell>
  );
}
  