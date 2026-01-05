import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import Swal from "sweetalert2";

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

export default function DashboardPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState(null);
  const [moduleFilter, setModuleFilter] = useState("all");

  /* ================= LOAD ROLE ================= */
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
      title: 'Hapus Data?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
    });

    if (!result.isConfirmed) return;

    const { error } = await supabase.from("submissions").delete().eq("id", id);
    
    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Gagal menghapus data',
        timer: 2000,
      });
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data berhasil dihapus',
        timer: 1500,
      });
      fetchData();
    }
  };

  /* ================= EXPORT EXCEL ================= */
  const exportExcel = () => {
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
      "Module": item.module_slug || '',
      "Judul": item.title || '',
      "Konten": item.content || '',
      "Nama Pengaju": item.sender_name || '',
      "Kontak": item.sender_contact || '',
      "Kode Tracking": item.tracking_code || '',
      "Status": item.status || 'pending',
      "Balasan Admin": item.admin_reply || '',
      "Tanggal Buat": new Date(item.created_at).toLocaleDateString('id-ID'),
      "Waktu Buat": new Date(item.created_at).toLocaleTimeString('id-ID'),
    }));

    // Buat worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Buat workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Pengajuan");
    
    // Styling header
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + "1";
      if (!ws[address]) continue;
      ws[address].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "2563eb" } }
      };
    }
    
    // Set column widths
    const colWidths = [
      { wch: 15 }, { wch: 30 }, { wch: 40 }, { wch: 20 },
      { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 30 },
      { wch: 15 }, { wch: 12 },
    ];
    ws['!cols'] = colWidths;

    // Export ke file
    XLSX.writeFile(wb, `pengajuan_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    Swal.fire({
      icon: 'success',
      title: 'Export Berhasil!',
      html: `
        <div class="text-center">
          <i class="fas fa-file-excel text-3xl text-green-500 mb-3"></i>
          <p class="text-lg font-semibold">${data.length} data berhasil diexport</p>
          <p class="text-sm text-gray-600">File Excel siap diunduh</p>
        </div>
      `,
      timer: 2000,
    });
  };

  /* ================= IMPORT EXCEL ================= */
  const handleFileUpload = (event) => {
    console.log("📁 File upload triggered", event.target.files);
    
    const file = event.target.files[0];
    if (!file) {
      console.log("❌ No file selected");
      return;
    }

    // Validasi file type
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      Swal.fire({
        icon: 'error',
        title: 'Format File Salah',
        text: 'Hanya file Excel (.xlsx, .xls) yang diperbolehkan',
        timer: 2000,
      });
      return;
    }

    // Validasi file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File Terlalu Besar',
        text: 'Ukuran file maksimal 10MB',
        timer: 2000,
      });
      return;
    }

    // Tampilkan preview dengan SweetAlert
    Swal.fire({
      title: 'Import Data Excel',
      html: `
        <div class="text-left">
          <p class="mb-2"><i class="fas fa-file-excel text-green-500 mr-2"></i>File: <strong>${file.name}</strong></p>
          <p class="mb-4"><i class="fas fa-weight-hanging text-gray-500 mr-2"></i>Ukuran: ${(file.size / 1024).toFixed(2)} KB</p>
          <div class="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <p class="font-semibold mb-2"><i class="fas fa-info-circle mr-2"></i>Pastikan format Excel sesuai:</p>
            <ul class="ml-4 mt-1 space-y-1">
              <li><i class="fas fa-check text-green-500 mr-2"></i>Kolom wajib: <code>Judul</code>, <code>Konten</code>, <code>Nama Pengaju</code></li>
              <li><i class="fas fa-check text-green-500 mr-2"></i>Status: pending/menunggu, process/diproses, done/selesai</li>
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
              const data = e.target.result;
              
              // Parse Excel
              const workbook = XLSX.read(data, { type: 'binary' });
              
              // Ambil sheet pertama
              const firstSheet = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[firstSheet];
              
              // Convert ke JSON
              const excelData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
              
              console.log("📊 Excel data parsed:", excelData);
              
              if (excelData.length === 0) {
                reject(new Error('File Excel kosong atau tidak memiliki data'));
                return;
              }

              // Process data
              const result = await processExcelData(excelData);
              resolve(result);
              
            } catch (error) {
              console.error('Import error:', error);
              reject(error);
            }
          };

          reader.onerror = () => {
            reject(new Error('Gagal membaca file'));
          };

          reader.readAsBinaryString(file);
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
              <p class="text-gray-600 mt-2">Data akan ditampilkan dalam beberapa detik...</p>
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

  /* ================= PROCESS EXCEL DATA ================= */
  const processExcelData = async (excelData) => {
    console.log("🔧 Processing Excel data:", excelData);
    
    if (excelData.length === 0) {
      throw new Error('File Excel kosong');
    }

    // Cari mapping kolom (case insensitive)
    const firstRow = excelData[0];
    console.log("📋 First row:", firstRow);
    
    const columnMapping = {};
    const columnNames = Object.keys(firstRow);
    
    // Map kolom berdasarkan nama (case insensitive)
    columnNames.forEach(key => {
      const lowerKey = key.toLowerCase().trim();
      
      if (lowerKey.includes('judul') || lowerKey.includes('title')) {
        columnMapping.title = key;
        console.log("✅ Mapped 'title' to:", key);
      }
      if (lowerKey.includes('konten') || lowerKey.includes('content') || lowerKey.includes('deskripsi')) {
        columnMapping.content = key;
        console.log("✅ Mapped 'content' to:", key);
      }
      if (lowerKey.includes('nama') || lowerKey.includes('sender') || lowerKey.includes('pengaju')) {
        columnMapping.sender_name = key;
        console.log("✅ Mapped 'sender_name' to:", key);
      }
      if (lowerKey.includes('module') || lowerKey.includes('modul') || lowerKey.includes('slug')) {
        columnMapping.module_slug = key;
        console.log("✅ Mapped 'module_slug' to:", key);
      }
      if (lowerKey.includes('kontak') || lowerKey.includes('contact')) {
        columnMapping.sender_contact = key;
        console.log("✅ Mapped 'sender_contact' to:", key);
      }
      if (lowerKey.includes('tracking') || lowerKey.includes('kode')) {
        columnMapping.tracking_code = key;
        console.log("✅ Mapped 'tracking_code' to:", key);
      }
      if (lowerKey.includes('status')) {
        columnMapping.status = key;
        console.log("✅ Mapped 'status' to:", key);
      }
      if (lowerKey.includes('balasan') || lowerKey.includes('reply') || lowerKey.includes('respon')) {
        columnMapping.admin_reply = key;
        console.log("✅ Mapped 'admin_reply' to:", key);
      }
    });

    console.log("🗺️ Column mapping:", columnMapping);

    // Validasi kolom minimal
    if (!columnMapping.title || !columnMapping.content || !columnMapping.sender_name) {
      const missing = [];
      if (!columnMapping.title) missing.push('Judul/Title');
      if (!columnMapping.content) missing.push('Konten/Content');
      if (!columnMapping.sender_name) missing.push('Nama Pengaju/Sender Name');
      throw new Error(`Kolom wajib tidak ditemukan: ${missing.join(', ')}`);
    }

    // Map status
    const statusMap = {
      'menunggu': 'pending',
      'diproses': 'process',
      'selesai': 'done',
      'pending': 'pending',
      'process': 'process',
      'done': 'done'
    };

    // Prepare data untuk insert
    const dataToInsert = excelData.map((row, index) => {
      // Helper function untuk get value dengan default
      const getValue = (column, defaultValue = '') => {
        if (!column || !row[column]) return defaultValue;
        return row[column].toString().trim();
      };

      const rowData = {
        module_slug: getValue(columnMapping.module_slug, null),
        title: getValue(columnMapping.title, ''),
        content: getValue(columnMapping.content, ''),
        sender_name: getValue(columnMapping.sender_name, ''),
        sender_contact: getValue(columnMapping.sender_contact, null),
        tracking_code: getValue(columnMapping.tracking_code, generateTrackingCode()),
        admin_reply: getValue(columnMapping.admin_reply, null),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Handle status
      if (columnMapping.status && row[columnMapping.status]) {
        const statusValue = row[columnMapping.status].toString().toLowerCase().trim();
        rowData.status = statusMap[statusValue] || 'pending';
      } else {
        rowData.status = 'pending';
      }

      console.log(`📝 Row ${index + 1}:`, rowData);
      return rowData;
    });

    console.log("🚀 Data to insert:", dataToInsert);

    // Import ke database
    const { error } = await supabase
      .from('submissions')
      .insert(dataToInsert);

    if (error) {
      console.error('Database error:', error);
      throw new Error('Gagal menyimpan data ke database: ' + error.message);
    }
    
    return dataToInsert.length;
  };

  /* ================= GENERATE TRACKING CODE ================= */
  const generateTrackingCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `TRK${code}`;
  };

  /* ================= DOWNLOAD TEMPLATE EXCEL ================= */
  const downloadTemplate = () => {
    const templateData = [
      {
        "Module": "keluhan",
        "Judul": "Contoh Pengajuan Keluhan",
        "Konten": "Deskripsi keluhan yang diajukan",
        "Nama Pengaju": "John Doe",
        "Kontak": "john@example.com",
        "Kode Tracking": "TRK123ABC",
        "Status": "pending",
        "Balasan Admin": "",
      },
      {
        "Module": "saran",
        "Judul": "Contoh Pengajuan Saran",
        "Konten": "Deskripsi saran untuk perbaikan",
        "Nama Pengaju": "Jane Smith",
        "Kontak": "081234567890",
        "Kode Tracking": "TRK456DEF",
        "Status": "process",
        "Balasan Admin": "Saran sedang ditinjau",
      }
    ];

    // Buat worksheet
    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // Buat workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    
    // Header styling
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + "1";
      if (!ws[address]) continue;
      ws[address].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "10B981" } }
      };
    }
    
    // Set column widths
    ws['!cols'] = [
      { wch: 12 }, { wch: 25 }, { wch: 35 }, { wch: 18 },
      { wch: 18 }, { wch: 15 }, { wch: 12 }, { wch: 25 }
    ];

    // Export ke file
    XLSX.writeFile(wb, "template_import_pengajuan.xlsx");
    
    Swal.fire({
      icon: 'info',
      title: 'Template Downloaded',
      html: `
        <div class="text-center">
          <i class="fas fa-file-excel text-3xl text-blue-500 mb-3"></i>
          <p>File template berhasil diunduh!</p>
          <p class="text-sm text-gray-600 mt-2">Gunakan file ini sebagai contoh format Excel</p>
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
          <button
            onClick={() => fileInputRef.current?.click()}
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
                Import Excel
              </>
            )}
          </button>

          <input
            type="file"
            ref={fileInputRef}
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            disabled={importing}
          />

          {/* Download Template */}
          <button
            onClick={downloadTemplate}
            className="border border-blue-300 bg-blue-50 text-blue-700 rounded-lg px-3 py-2 text-sm hover:bg-blue-100 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-download text-blue-500"></i>
            Template
          </button>

          {/* Export Excel */}
          <button
            onClick={exportExcel}
            disabled={data.length === 0}
            className={`border rounded-lg px-3 py-2 text-sm transition-colors flex items-center gap-2 ${
              data.length === 0
                ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                : "bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
            }`}
          >
            <i className="fas fa-file-excel text-green-500"></i>
            Export Excel
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
              Mulai dengan mengimport data Excel
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
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <div 
                        className="cursor-pointer"
                        onClick={() => navigate(`/admin/submissions/${d.id}`)}
                      >
                        <p className="font-medium text-gray-900 hover:text-blue-600">
                          <i className="fas fa-file-alt mr-2 text-gray-400"></i>
                          {d.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-xs ml-6">
                          {d.content || 'Tidak ada konten'}
                        </p>
                      </div>
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-gray-900">
                        <i className="fas fa-user mr-2 text-gray-400"></i>
                        {d.sender_name}
                      </p>
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
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badge[d.status]}`}>
                        {d.status === 'pending' && <i className="fas fa-clock mr-1"></i>}
                        {d.status === 'process' && <i className="fas fa-spinner mr-1"></i>}
                        {d.status === 'done' && <i className="fas fa-check-circle mr-1"></i>}
                        {d.status}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {new Date(d.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/submissions/${d.id}`)}
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-blue-50"
                        >
                          <i className="fas fa-eye text-xs"></i>
                          Detail
                        </button>
                        {role === "super" && (
                          <button
                            onClick={() => remove(d.id)}
                            className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-50"
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
      <div className="text-sm text-gray-500">
        <p>
          <i className="fas fa-user-shield mr-2 text-blue-500"></i>
          Role: <span className="font-bold">{role}</span> • 
          <i className="fas fa-sync-alt ml-3 mr-2 text-green-500"></i>
          Terakhir update: {new Date().toLocaleTimeString('id-ID')}
        </p>
      </div>
    </div>
  );
}