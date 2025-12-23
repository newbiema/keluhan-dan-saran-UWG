import { useState } from "react";
import AppShell from "../components/AppShell";

export default function CheckStatusPage() {
  const [ticket, setTicket] = useState("");
  const [email, setEmail] = useState("");

  return (
    <AppShell title="Cek Status">
      <section className="rounded-3xl border bg-white p-4">
        <p className="text-sm font-semibold">Masukkan Ticket</p>
        <p className="mt-1 text-xs text-gray-500">
          Gunakan ticket_id yang kamu dapat setelah submit.
        </p>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="text-xs text-gray-600">Ticket ID</span>
            <div className="mt-1 flex items-center gap-2 rounded-2xl border bg-gray-50 px-3 py-2">
              <i className="fa-solid fa-ticket text-gray-400"></i>
              <input
                className="w-full bg-transparent outline-none text-sm"
                placeholder="Contoh: KEL-20251220-123456"
                value={ticket}
                onChange={(e) => setTicket(e.target.value)}
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs text-gray-600">Email (opsional)</span>
            <div className="mt-1 flex items-center gap-2 rounded-2xl border bg-gray-50 px-3 py-2">
              <i className="fa-solid fa-envelope text-gray-400"></i>
              <input
                className="w-full bg-transparent outline-none text-sm"
                placeholder="nama@kampus.ac.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </label>

          <button className="w-full rounded-2xl bg-black py-3 text-sm font-semibold text-white active:scale-[0.99] transition">
            <i className="fa-solid fa-magnifying-glass mr-2"></i>
            Cek Status
          </button>
        </div>
      </section>

      {/* Placeholder status card */}
      <section className="mt-4 rounded-3xl border bg-white p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Status Pengajuan</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs">
            <i className="fa-solid fa-clock"></i> DIAJUKAN
          </span>
        </div>
        <p className="mt-2 text-xs text-gray-600">
          Setelah kamu klik cek, di sini akan muncul detail pengajuan & balasan admin.
        </p>
      </section>
    </AppShell>
  );
}
