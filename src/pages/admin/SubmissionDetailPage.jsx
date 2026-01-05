import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Swal from "sweetalert2";

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [status, setStatus] = useState("pending");
  const [adminReply, setAdminReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ================= FETCH DETAIL ================= */
  const fetchDetail = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      Swal.fire({
        icon: 'error',
        title: 'Data Tidak Ditemukan',
        text: 'Pengajuan tidak ditemukan atau telah dihapus',
        timer: 2000,
      }).then(() => {
        navigate("/admin/dashboard");
      });
      return;
    }

    setData(data);
    setStatus(data.status || "pending");
    setAdminReply(data.admin_reply || "");
    setLoading(false);
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  /* ================= SAVE ================= */
  const save = async () => {
    if (!data) return;
    
    setSaving(true);
    
    const { error } = await supabase
      .from("submissions")
      .update({
        status,
        admin_reply: adminReply,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: 'Terjadi kesalahan saat menyimpan perubahan',
        timer: 2000,
      });
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Disimpan!',
        html: `
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <i class="fas fa-check text-2xl text-green-600"></i>
            </div>
            <p class="text-gray-700 font-medium">Perubahan berhasil disimpan</p>
            <p class="text-sm text-gray-500 mt-2">Status: <span class="font-semibold capitalize">${status}</span></p>
          </div>
        `,
        timer: 1500,
      });
      fetchDetail();
    }
    
    setSaving(false);
  };

  /* ================= DELETE ================= */
  const remove = async () => {
    const result = await Swal.fire({
      title: 'Hapus Pengajuan?',
      html: `
        <div class="text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <i class="fas fa-trash-alt text-2xl text-red-600"></i>
          </div>
          <p class="text-gray-700 font-medium">Anda yakin ingin menghapus pengajuan ini?</p>
          <p class="text-sm text-gray-500 mt-2">Aksi ini tidak dapat dibatalkan</p>
          <div class="mt-4 p-3 bg-gray-50 rounded-lg text-left">
            <p class="text-sm font-medium">Detail Pengajuan:</p>
            <p class="text-xs text-gray-600 mt-1">${data?.title}</p>
            <p class="text-xs text-gray-500">Oleh: ${data?.sender_name}</p>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '<i class="fas fa-trash mr-2"></i>Ya, Hapus',
      cancelButtonText: '<i class="fas fa-times mr-2"></i>Batal',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    Swal.fire({
      title: 'Menghapus...',
      text: 'Sedang menghapus data...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const { error } = await supabase.from("submissions").delete().eq("id", id);
    
    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menghapus',
        text: 'Terjadi kesalahan saat menghapus data',
        timer: 2000,
      });
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Dihapus!',
        html: `
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <i class="fas fa-check-circle text-2xl text-green-600"></i>
            </div>
            <p class="text-gray-700 font-medium">Pengajuan berhasil dihapus</p>
            <p class="text-sm text-gray-500 mt-2">Mengarahkan ke dashboard...</p>
          </div>
        `,
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        navigate("/admin/dashboard");
      });
    }
  };

  /* ================= UI ================= */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
        <div className="text-center">
          <p className="text-gray-700 font-medium">Memuat detail pengajuan...</p>
          <p className="text-sm text-gray-500 mt-1">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Status badge styling
  const statusBadge = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
    process: "bg-blue-100 text-blue-700 border-blue-300",
    done: "bg-green-100 text-green-700 border-green-300",
  };

  // Module icon mapping
  const moduleIcons = {
    keluhan: "fas fa-exclamation-triangle",
    saran: "fas fa-lightbulb",
    pengaduan: "fas fa-comment-dots",
    default: "fas fa-folder",
  };

  const getModuleIcon = (slug) => {
    return moduleIcons[slug] || moduleIcons.default;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* ===== HEADER ===== */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-2 mb-4 group"
          >
            <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
            Kembali ke Dashboard
          </button>
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <i className="fas fa-file-alt text-blue-600 text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{data.title}</h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <i className="fas fa-calendar-day"></i>
                  <span>{new Date(data.created_at).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <i className="fas fa-clock"></i>
                  <span>{new Date(data.created_at).toLocaleTimeString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-xs text-gray-500 mb-1">Kode Tracking</div>
          <div className="flex items-center gap-2">
            <i className="fas fa-barcode text-gray-400"></i>
            <span className="font-mono font-bold text-gray-700">{data.tracking_code}</span>
          </div>
        </div>
      </div>

      {/* ===== CONTENT GRID ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Informasi */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pengirim Info */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-user-circle text-blue-500"></i>
              Informasi Pengirim
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <i className="fas fa-user text-gray-400"></i>
                  Nama Lengkap
                </div>
                <p className="font-medium text-gray-900">{data.sender_name || "-"}</p>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <i className="fas fa-phone text-gray-400"></i>
                  Kontak
                </div>
                <p className="font-medium text-gray-900">{data.sender_contact || "-"}</p>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <i className="fas fa-layer-group text-gray-400"></i>
                  Modul
                </div>
                <div className="flex items-center gap-2">
                  <i className={`${getModuleIcon(data.module_slug)} text-gray-500`}></i>
                  <span className="font-medium text-gray-900 capitalize">{data.module_slug}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <i className="fas fa-flag text-gray-400"></i>
                  Status Saat Ini
                </div>
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${statusBadge[data.status]}`}>
                  {data.status === 'pending' && <i className="fas fa-clock"></i>}
                  {data.status === 'process' && <i className="fas fa-spinner fa-spin"></i>}
                  {data.status === 'done' && <i className="fas fa-check-circle"></i>}
                  {data.status}
                </span>
              </div>
            </div>
          </div>

          {/* Isi Pengajuan */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <i className="fas fa-message text-blue-500"></i>
                Isi Pengajuan
              </h3>
              <span className="text-xs text-gray-500">
                <i className="fas fa-file-alt mr-1"></i>
                Konten
              </span>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {data.content}
              </p>
            </div>
            
            {data.content.length < 50 && (
              <div className="mt-3 text-sm text-gray-500 flex items-center gap-2">
                <i className="fas fa-info-circle"></i>
                Pengajuan ini memiliki konten yang singkat
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Admin Actions */}
        <div className="space-y-6">
          {/* Status Update */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-edit text-blue-500"></i>
              Update Status
            </h3>
            
            <div className="space-y-3">
              {['pending', 'process', 'done'].map((stat) => (
                <label key={stat} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    value={stat}
                    checked={status === stat}
                    onChange={(e) => setStatus(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      stat === 'pending' ? 'bg-yellow-500' :
                      stat === 'process' ? 'bg-blue-500' : 'bg-green-500'
                    }`}></div>
                    <span className="font-medium capitalize">{stat}</span>
                  </div>
                </label>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                <i className="fas fa-history"></i>
                Status saat ini
              </div>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusBadge[data.status]}`}>
                {data.status === 'pending' && <i className="fas fa-clock"></i>}
                {data.status === 'process' && <i className="fas fa-spinner"></i>}
                {data.status === 'done' && <i className="fas fa-check-circle"></i>}
                {data.status}
              </div>
            </div>
          </div>

          {/* Admin Reply */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-reply text-blue-500"></i>
              Balasan Admin
            </h3>
            
            <div className="space-y-3">
              <textarea
                value={adminReply}
                onChange={(e) => setAdminReply(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                rows={6}
                placeholder="Tulis balasan untuk pengirim..."
              />
              
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <i className="fas fa-info-circle"></i>
                Balasan akan dikirim ke pengirim
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={save}
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Menyimpan...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  Simpan Perubahan
                </>
              )}
            </button>
            
            <button
              onClick={remove}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg py-3 font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <i className="fas fa-trash-alt"></i>
              Hapus Pengajuan
            </button>
            
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg py-3 font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <i className="fas fa-times"></i>
              Batal
            </button>
          </div>
        </div>
      </div>

      {/* ===== FOOTER INFO ===== */}
      <div className="text-sm text-gray-500 border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <i className="fas fa-clock"></i>
              <span>Dibuat: {new Date(data.created_at).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fas fa-sync-alt"></i>
              <span>Diperbarui: {new Date(data.updated_at || data.created_at).toLocaleString('id-ID')}</span>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            ID: <span className="font-mono">{data.id.substring(0, 8)}...</span>
          </div>
        </div>
      </div>
    </div>
  );
}