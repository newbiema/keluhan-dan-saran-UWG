import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

/* ===== CHART ===== */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

/* ===== CSV ===== */
import Papa from "papaparse";
import { saveAs } from "file-saver";

/* ===== SWEETALERT ===== */
import Swal from "sweetalert2";

export default function DashboardPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState(null);
  const [moduleFilter, setModuleFilter] = useState("all");

  /* ================= LOAD ROLE FROM admin_profiles ================= */
  useEffect(() => {
    async function loadRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("admin_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setRole(data?.role || "operator");
    }

    loadRole();
  }, []);

  /* ================= FETCH DATA ================= */
  const fetchData = async () => {
    setLoading(true);

    let query = supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (status !== "all") query = query.eq("status", status);
    if (moduleFilter !== "all") query = query.eq("module_slug", moduleFilter);

    const { data } = await query;
    setData(data || []);
    setLoading(false);
  };

  /* ================= REALTIME ================= */
  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("submissions-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "submissions" },
        fetchData
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [status, moduleFilter]);

  /* ================= GET MODULE LIST ================= */
  const [modules, setModules] = useState([]);
  useEffect(() => {
    async function getModules() {
      const { data } = await supabase
        .from("submissions")
        .select("module_slug")
        .not("module_slug", "is", null);
      
      const uniqueModules = [...new Set(data.map(item => item.module_slug))].filter(Boolean);
      setModules(uniqueModules);
    }
    getModules();
  }, []);

  /* ================= DELETE ================= */
  const remove = async (id) => {
    if (role !== "super") return;

    const result = await Swal.fire({
      title: 'Hapus Data',
      text: "Apakah Anda yakin ingin menghapus pengajuan ini?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    });

    if (!result.isConfirmed) return;

    const { error } = await supabase.from("submissions").delete().eq("id", id);
    
    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Gagal menghapus data',
        timer: 2000,
      });
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Data berhasil dihapus',
        timer: 1500,
      });
      fetchData();
    }
  };

  /* ================= EXPORT CSV ================= */
  const exportCSV = () => {
    if (data.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Data Kosong',
        text: 'Tidak ada data untuk diexport',
        timer: 2000,
      });
      return;
    }

    const exportData = data.map(item => ({
      module_slug: item.module_slug || '',
      title: item.title || '',
      content: item.content || '',
      sender_name: item.sender_name || '',
      sender_contact: item.sender_contact || '',
      tracking_code: item.tracking_code || '',
      status: item.status || 'pending',
      admin_reply: item.admin_reply || '',
      created_at: new Date(item.created_at).toISOString(),
      updated_at: new Date(item.updated_at || item.created_at).toISOString(),
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `submissions_${new Date().toISOString().split('T')[0]}.csv`);
    
    Swal.fire({
      icon: 'success',
      title: 'Export Berhasil',
      text: `File CSV berhasil diunduh (${data.length} data)`,
      timer: 2000,
    });
  };

  /* ================= IMPORT CSV ================= */
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validasi file type
    if (!file.name.endsWith('.csv')) {
      Swal.fire({
        icon: 'error',
        title: 'Format File Salah',
        text: 'Hanya file CSV yang diperbolehkan',
        timer: 2000,
      });
      return;
    }

    // Validasi file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File Terlalu Besar',
        text: 'Ukuran file maksimal 5MB',
        timer: 2000,
      });
      return;
    }

    Swal.fire({
      title: 'Import Data CSV',
      html: `
        <div class="text-left">
          <p class="mb-2"><i class="fas fa-file-csv text-blue-500 mr-2"></i>File: <strong>${file.name}</strong></p>
          <p class="mb-4"><i class="fas fa-weight-hanging text-gray-500 mr-2"></i>Ukuran: ${(file.size / 1024).toFixed(2)} KB</p>
          <div class="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <p class="font-semibold mb-2"><i class="fas fa-info-circle mr-2"></i>Pastikan format CSV sesuai:</p>
            <ul class="ml-4 mt-1 space-y-1">
              <li><i class="fas fa-check text-green-500 mr-2"></i>Kolom wajib: <code>title</code>, <code>content</code>, <code>sender_name</code></li>
              <li><i class="fas fa-check text-green-500 mr-2"></i>Kolom opsional: <code>module_slug</code>, <code>sender_contact</code>, <code>tracking_code</code>, <code>status</code>, <code>admin_reply</code></li>
              <li><i class="fas fa-check text-green-500 mr-2"></i>Status: pending, process, done</li>
            </ul>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Import Sekarang',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#3b82f6',
      showLoaderOnConfirm: true,
      preConfirm: () => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          
          reader.onload = async (e) => {
            try {
              setImporting(true);
              const csvText = e.target.result;
              
              // Parse CSV
              Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: async (results) => {
                  if (results.errors.length > 0) {
                    reject(new Error('Format CSV tidak valid: ' + results.errors[0].message));
                    return;
                  }

                  const csvData = results.data;
                  
                  if (csvData.length === 0) {
                    reject(new Error('File CSV kosong'));
                    return;
                  }

                  // Validasi kolom minimal
                  const requiredColumns = ['title', 'content', 'sender_name'];
                  const firstRow = csvData[0];
                  const missingColumns = requiredColumns.filter(col => !firstRow.hasOwnProperty(col));
                  
                  if (missingColumns.length > 0) {
                    reject(new Error(`Kolom wajib tidak ditemukan: ${missingColumns.join(', ')}`));
                    return;
                  }

                  // Validasi status jika ada
                  const validStatuses = ['pending', 'process', 'done'];
                  const invalidRows = csvData.filter(row => 
                    row.status && !validStatuses.includes(row.status.toLowerCase())
                  );
                  
                  if (invalidRows.length > 0) {
                    reject(new Error(`${invalidRows.length} baris memiliki status tidak valid. Gunakan: pending, process, atau done`));
                    return;
                  }

                  // Import ke database
                  const { error } = await supabase
                    .from('submissions')
                    .insert(
                      csvData.map(row => ({
                        module_slug: row.module_slug || null,
                        title: row.title || '',
                        content: row.content || '',
                        sender_name: row.sender_name || '',
                        sender_contact: row.sender_contact || null,
                        tracking_code: row.tracking_code || generateTrackingCode(),
                        status: (row.status || 'pending').toLowerCase(),
                        admin_reply: row.admin_reply || null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                      }))
                    );

                  if (error) throw error;
                  
                  resolve(csvData.length);
                },
                error: (error) => {
                  reject(new Error('Gagal membaca file CSV'));
                }
              });
            } catch (error) {
              reject(error);
            }
          };

          reader.onerror = () => {
            reject(new Error('Gagal membaca file'));
          };

          reader.readAsText(file, 'UTF-8');
        });
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        const successCount = result.value;
        Swal.fire({
          icon: 'success',
          title: 'Import Berhasil!',
          html: `
            <div class="text-center">
              <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <i class="fas fa-check text-2xl text-green-600"></i>
              </div>
              <p class="text-lg font-bold text-gray-800"><i class="fas fa-database mr-2"></i>${successCount} data berhasil diimport</p>
              <p class="text-gray-600 mt-2"><i class="fas fa-sync-alt fa-spin mr-2"></i>Data akan ditampilkan dalam beberapa detik...</p>
            </div>
          `,
          timer: 2000,
        });
        
        // Refresh data
        setTimeout(() => {
          fetchData();
        }, 1500);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }).catch((error) => {
      Swal.fire({
        icon: 'error',
        title: 'Import Gagal',
        html: `
          <div class="text-left">
            <p><i class="fas fa-exclamation-triangle text-red-500 mr-2"></i><strong>${error.message}</strong></p>
            <div class="mt-3 p-3 bg-red-50 rounded-lg">
              <p class="text-sm"><i class="fas fa-lightbulb mr-2"></i>Tips:</p>
              <ul class="ml-4 mt-1 text-sm space-y-1">
                <li><i class="fas fa-download mr-2"></i>Download template untuk contoh format</li>
                <li><i class="fas fa-columns mr-2"></i>Pastikan kolom sesuai dengan template</li>
                <li><i class="fas fa-check-circle mr-2"></i>Status harus: pending, process, atau done</li>
              </ul>
            </div>
          </div>
        `,
        timer: 4000,
      });
    }).finally(() => {
      setImporting(false);
    });
  };

  /* ================= GENERATE TRACKING CODE ================= */
  const generateTrackingCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  /* ================= DOWNLOAD TEMPLATE CSV ================= */
  const downloadTemplate = () => {
    const templateData = [
      {
        module_slug: "keluhan",
        title: "Contoh Pengajuan Keluhan",
        content: "Deskripsi keluhan yang diajukan",
        sender_name: "John Doe",
        sender_contact: "john@example.com",
        tracking_code: "TRK" + generateTrackingCode(),
        status: "pending",
        admin_reply: "",
      },
      {
        module_slug: "saran",
        title: "Contoh Pengajuan Saran",
        content: "Deskripsi saran untuk perbaikan",
        sender_name: "Jane Smith",
        sender_contact: "081234567890",
        tracking_code: "TRK" + generateTrackingCode(),
        status: "process",
        admin_reply: "Saran sedang ditinjau",
      }
    ];

    const csv = Papa.unparse(templateData);
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "template_import_submissions.csv");
    
    Swal.fire({
      icon: 'info',
      title: 'Template Downloaded',
      html: `
        <div class="text-center">
          <i class="fas fa-file-download text-3xl text-blue-500 mb-3"></i>
          <p>File template berhasil diunduh</p>
          <p class="text-sm text-gray-600 mt-2">Gunakan file ini sebagai contoh format CSV</p>
        </div>
      `,
      timer: 2000,
    });
  };

  /* ================= STATS ================= */
  const stats = {
    pending: data.filter((d) => d.status === "pending").length,
    process: data.filter((d) => d.status === "process").length,
    done: data.filter((d) => d.status === "done").length,
    total: data.length,
  };

  const chartData = [
    { name: "Pending", value: stats.pending, color: "#fbbf24", icon: "fas fa-clock" },
    { name: "Diproses", value: stats.process, color: "#60a5fa", icon: "fas fa-spinner" },
    { name: "Selesai", value: stats.done, color: "#34d399", icon: "fas fa-check-circle" },
  ];

  const badge = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
    process: "bg-blue-100 text-blue-700 border-blue-300",
    done: "bg-green-100 text-green-700 border-green-300",
  };

  const moduleIcons = {
    keluhan: "fas fa-exclamation-triangle",
    saran: "fas fa-lightbulb",
    pengaduan: "fas fa-comment-dots",
    default: "fas fa-folder",
  };

  const getModuleIcon = (slug) => {
    return moduleIcons[slug] || moduleIcons.default;
  };

  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            <i className="fas fa-tachometer-alt mr-2 text-blue-500"></i>
            Dashboard Admin
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            <i className="fas fa-database mr-1"></i>
            Total: <span className="font-semibold">{stats.total}</span> pengajuan • 
            <i className="fas fa-clock ml-3 mr-1 text-yellow-500"></i>
            Pending: <span className="font-semibold text-yellow-600">{stats.pending}</span> • 
            <i className="fas fa-spinner ml-3 mr-1 text-blue-500"></i>
            Diproses: <span className="font-semibold text-blue-600">{stats.process}</span> • 
            <i className="fas fa-check-circle ml-3 mr-1 text-green-500"></i>
            Selesai: <span className="font-semibold text-green-600">{stats.done}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Module Filter */}
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">
              <i className="fas fa-layer-group mr-2"></i>
              Semua Modul
            </option>
            {modules.map(module => (
              <option key={module} value={module}>
                <i className={`${getModuleIcon(module)} mr-2`}></i>
                {module}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">
              <i className="fas fa-filter mr-2"></i>
              Semua Status
            </option>
            <option value="pending">
              <i className="fas fa-clock mr-2 text-yellow-500"></i>
              Pending
            </option>
            <option value="process">
              <i className="fas fa-spinner mr-2 text-blue-500"></i>
              Diproses
            </option>
            <option value="done">
              <i className="fas fa-check-circle mr-2 text-green-500"></i>
              Selesai
            </option>
          </select>

          {/* File Upload Button */}
          <label className="cursor-pointer">
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              disabled={importing}
            />
            <button
              disabled={importing}
              className={`border border-gray-300 rounded-lg px-3 py-2 text-sm transition-colors flex items-center gap-2 ${
                importing 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : "bg-white hover:bg-gray-50 text-gray-700"
              }`}
            >
              {importing ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Importing...
                </>
              ) : (
                <>
                  <i className="fas fa-file-import text-blue-500"></i>
                  Import CSV
                </>
              )}
            </button>
          </label>

          {/* Download Template */}
          <button
            onClick={downloadTemplate}
            className="border border-blue-300 bg-blue-50 text-blue-700 rounded-lg px-3 py-2 text-sm hover:bg-blue-100 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-download text-blue-500"></i>
            Template
          </button>

          {/* Export CSV */}
          <button
            onClick={exportCSV}
            disabled={data.length === 0}
            className={`border rounded-lg px-3 py-2 text-sm transition-colors flex items-center gap-2 ${
              data.length === 0
                ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                : "bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
            }`}
          >
            <i className="fas fa-file-export text-green-500"></i>
            Export CSV
          </button>
        </div>
      </div>

      {/* STATS CHART */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">
            <i className="fas fa-chart-bar mr-2 text-blue-500"></i>
            Statistik Pengajuan
          </h3>
          <div className="flex gap-4">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <i className={`${item.icon} text-sm`}></i>
                <span className="text-sm text-gray-600">{item.name}:</span>
                <span className="font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip 
              formatter={(value) => [value, 'Jumlah']}
              labelStyle={{ fontWeight: 'bold' }}
            />
            <Bar 
              dataKey="value" 
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">
            <i className="fas fa-list mr-2 text-blue-500"></i>
            Daftar Pengajuan
          </h3>
          <span className="text-xs text-gray-500">
            <i className="fas fa-eye mr-1"></i>
            Menampilkan {data.length} dari {stats.total} data
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <i className="fas fa-spinner fa-spin text-3xl text-blue-500 mb-3"></i>
            <p className="text-gray-500">Memuat data...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <i className="fas fa-inbox text-2xl text-gray-400"></i>
            </div>
            <p className="text-gray-500 font-medium">Belum ada pengajuan</p>
            <p className="text-sm text-gray-400 mt-1">
              {status === 'all' && moduleFilter === 'all'
                ? 'Mulai dengan mengimport data CSV atau tambah data manual'
                : `Tidak ada data dengan filter "${moduleFilter !== 'all' ? 'Modul: ' + moduleFilter + ' ' : ''}${status !== 'all' ? 'Status: ' + status : ''}"`
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <i className="fas fa-file-alt mr-1"></i> Judul
                  </th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <i className="fas fa-user mr-1"></i> Pengaju
                  </th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <i className="fas fa-tag mr-1"></i> Modul
                  </th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <i className="fas fa-flag mr-1"></i> Status
                  </th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <i className="fas fa-calendar mr-1"></i> Tanggal
                  </th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <i className="fas fa-cog mr-1"></i> Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((d) => (
                  <tr
                    key={d.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3">
                      <div 
                        className="cursor-pointer group"
                        onClick={() => navigate(`/admin/submissions/${d.id}`)}
                      >
                        <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          <i className="fas fa-file-alt mr-2 text-gray-400"></i>
                          {d.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-xs ml-6">
                          {d.content || 'Tidak ada konten'}
                        </p>
                        {d.tracking_code && (
                          <p className="text-xs text-gray-400 mt-1 ml-6">
                            <i className="fas fa-barcode mr-1"></i>
                            {d.tracking_code}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          <i className="fas fa-user mr-2 text-gray-400"></i>
                          {d.sender_name}
                        </p>
                        {d.sender_contact && (
                          <p className="text-xs text-gray-500 mt-1 ml-6">
                            <i className="fas fa-phone mr-1"></i>
                            {d.sender_contact}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <i className={`${getModuleIcon(d.module_slug)} mr-2 text-gray-500`}></i>
                        <span className="px-2 py-1 rounded-lg text-xs bg-gray-100 text-gray-700">
                          {d.module_slug || 'umum'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${badge[d.status]}`}
                      >
                        {d.status === 'pending' && <i className="fas fa-clock mr-1"></i>}
                        {d.status === 'process' && <i className="fas fa-spinner mr-1"></i>}
                        {d.status === 'done' && <i className="fas fa-check-circle mr-1"></i>}
                        {d.status}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      <div>
                        <div className="flex items-center">
                          <i className="fas fa-calendar-day mr-2 text-gray-400"></i>
                          {new Date(d.created_at).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          <i className="fas fa-clock mr-1"></i>
                          {new Date(d.created_at).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/submissions/${d.id}`)}
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors border border-blue-200"
                          title="Lihat Detail"
                        >
                          <i className="fas fa-eye text-xs"></i>
                          Detail
                        </button>
                        {role === "super" && (
                          <button
                            onClick={() => remove(d.id)}
                            className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors border border-red-200"
                            title="Hapus Data"
                          >
                            <i className="fas fa-trash-alt text-xs"></i>
                            Hapus
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FOOTER INFO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-gray-500">
        <div>
          <p>
            <i className="fas fa-user-shield mr-2 text-blue-500"></i>
            Role: <span className="font-bold text-gray-700">{role}</span> • 
            <i className="fas fa-sync-alt ml-3 mr-2 text-green-500"></i>
            Terakhir update: <span className="font-medium">{new Date().toLocaleTimeString('id-ID')}</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <i className="fas fa-info-circle text-blue-500"></i>
            <span>Import CSV maksimal 5MB</span>
          </div>
          <button
            onClick={() => {
              Swal.fire({
                icon: 'info',
                title: 'Format CSV untuk Import',
                html: `
                  <div class="text-left">
                    <p class="mb-3 font-semibold"><i class="fas fa-file-csv mr-2"></i>Kolom yang wajib ada:</p>
                    <ul class="space-y-1 ml-4">
                      <li><i class="fas fa-asterisk text-red-500 mr-2"></i><code>title</code> - Judul pengajuan</li>
                      <li><i class="fas fa-asterisk text-red-500 mr-2"></i><code>content</code> - Konten/deskripsi</li>
                      <li><i class="fas fa-asterisk text-red-500 mr-2"></i><code>sender_name</code> - Nama pengaju</li>
                    </ul>
                    <p class="mt-4 mb-2 font-semibold"><i class="fas fa-plus-circle mr-2"></i>Kolom opsional:</p>
                    <ul class="space-y-1 ml-4">
                      <li><i class="fas fa-folder mr-2 text-gray-500"></i><code>module_slug</code> - Modul (keluhan/saran/dll)</li>
                      <li><i class="fas fa-phone mr-2 text-gray-500"></i><code>sender_contact</code> - Kontak pengaju</li>
                      <li><i class="fas fa-barcode mr-2 text-gray-500"></i><code>tracking_code</code> - Kode tracking</li>
                      <li><i class="fas fa-flag mr-2 text-gray-500"></i><code>status</code> - pending/process/done</li>
                      <li><i class="fas fa-reply mr-2 text-gray-500"></i><code>admin_reply</code> - Balasan admin</li>
                    </ul>
                    <div class="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p class="text-sm"><i class="fas fa-lightbulb mr-2"></i><strong>Tips:</strong></p>
                      <ul class="ml-4 mt-1 text-sm space-y-1">
                        <li><i class="fas fa-download mr-2"></i>Download template untuk contoh format</li>
                        <li><i class="fas fa-check mr-2"></i>Status otomatis jadi "pending" jika kosong</li>
                        <li><i class="fas fa-code mr-2"></i>Tracking code otomatis dibuat jika kosong</li>
                      </ul>
                    </div>
                  </div>
                `,
                width: '600px',
                confirmButtonText: 'Mengerti',
                confirmButtonColor: '#3b82f6',
              });
            }}
            className="text-blue-600 hover:text-blue-800 underline underline-offset-2 flex items-center gap-1"
          >
            <i className="fas fa-question-circle"></i>
            Panduan Format CSV
          </button>
        </div>
      </div>
    </div>
  );
}