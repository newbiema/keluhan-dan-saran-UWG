import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Swal from "sweetalert2";

export default function AdminCompleteProfilePage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();

    if (!name || password.length < 6) {
      Swal.fire("Error", "Nama & password wajib diisi", "error");
      return;
    }

    // set password
    const { error: pwError } = await supabase.auth.updateUser({
      password,
    });

    if (pwError) {
      Swal.fire("Error", pwError.message, "error");
      return;
    }

    // update admin_profiles
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase
      .from("admin_profiles")
      .update({ name })
      .eq("id", user.id);

    Swal.fire("Berhasil", "Profil admin lengkap", "success");
    navigate("/admin/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-white p-6 rounded-xl space-y-4"
      >
        <h1 className="text-lg font-bold">Lengkapi Profil Admin</h1>

        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Nama lengkap"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="password"
          className="w-full border rounded px-3 py-2"
          placeholder="Password baru"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-blue-600 text-white rounded py-2">
          Simpan & Masuk Dashboard
        </button>
      </form>
    </div>
  );
}
