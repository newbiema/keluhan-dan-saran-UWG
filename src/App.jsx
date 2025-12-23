
import './App.css'

export default function App() {
  return (
    <div className="min-h-screen p-4">
      <h1 className="flex items-center gap-2 text-xl font-bold">
        <i className="fa-solid fa-circle-exclamation text-red-500"></i>
        Keluhan & Saran Mahasiswa
      </h1>

      <button className="mt-6 flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-white">
        <i className="fa-solid fa-paper-plane"></i>
        Kirim Pengajuan
      </button>
    </div>
  );
}

