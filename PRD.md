# Product Requirements Document (PRD)
## Sistem Informasi Mutu Rumah Sakit (SIMURS)
### Versi Vanilla JS

**Versi:** 1.2.0  
**Tanggal:** Juli 2026  
**Status:** Updated & Production-Ready  

---

## 1. Overview

### 1.1 Latar Belakang

Pencatatan data indikator mutu rumah sakit sebelumnya dilakukan secara manual menggunakan file Excel (.xlsx) dengan puluhan sheet terpisah, mencakup indikator keselamatan pasien, pelayanan klinis, IGD, hemodialisa, operasi, gizi, farmasi, radiologi, laboratorium, rekam medis, rehabilitasi medis, laundry, dan SIMRS IT. Proses manual ini rentan kesalahan input, tidak memiliki validasi otomatis, sulit diakses banyak pengguna secara bersamaan, dan menyulitkan pelaporan agregat bulanan.

### 1.2 Tujuan Produk

Membangun aplikasi web berbasis Vanilla JS (tanpa framework frontend) untuk input, penyimpanan, dan pelaporan data mutu rumah sakit yang:
- Menggantikan pencatatan manual di Excel dengan **57+ Modul Indikator Mutu Terintegrasi**.
- Menyediakan validasi data secara real-time (client-side & server-side).
- Menghitung nilai kepatuhan dan indikator mutu secara otomatis.
- Menghasilkan laporan bulanan yang dapat diekspor ke Excel (.xlsx) dan PDF / Cetak secara presisi.
- Dapat diakses multi-user sesuai peran (Role-Based Access Control) dengan granularitas penugasan unit.
- Ringan, cepat, responsif, dan tidak memerlukan proses build/compile di sisi frontend.

### 1.3 Stakeholder & Pengguna

| Peran | Level Akses | Hak Akses / Fungsionalitas Utama |
|---|---|---|
| **Admin** | Administrator | Hak akses penuh: CRUD semua data indikator, manajemen pengguna (tambah, edit, hapus), penguncian periode (buka & tutup periode), serta menelusuri log audit (Audit Trail). |
| **Komite Mutu** | Evaluator / Auditor | Monitoring dashboard kinerja interaktif, penyaringan pencapaian indikator, pengawasan audit trail, serta ekspor dan pencetakan laporan bulanan/tahunan. |
| **PIC Mutu** | Operator Terbatas | Mengisi dan mereview data indikator mutu di ruangan/unit kerja yang ditugaskan. Hak akses modul dibatasi secara granular oleh Admin melalui checklist. |
| **Petugas** | Operator Terbatas | Mengisi data indikator mutu di ruangan/unit kerja yang ditugaskan. Hak akses modul dibatasi secara granular oleh Admin melalui checklist. |

---

## 2. Tech Stack

### 2.1 Frontend (Vanilla JS — tanpa framework)

| Kategori | Pilihan | Keterangan |
|---|---|---|
| **Bahasa** | HTML5 + CSS3 + JavaScript (ES6+ Modules) | Tanpa transpiler, dijalankan langsung oleh browser |
| **Styling** | CSS Custom Properties + Flexbox/Grid | Design system kustom tanpa framework CSS |
| **Routing** | Hash-based SPA router (custom, `router.js`) | Navigasi `#/dashboard`, `#/risiko-jatuh`, dll — tanpa library |
| **HTTP Client** | Native `fetch()` API (`client.js`) | Wrapper terpusat dengan auto-auth header & error handling |
| **State Management** | Global Store (`store.js`) | Menyimpan state user, periode, unit, dan `indicatorSummariesCache` |
| **Chart** | Chart.js (CDN dengan tag `defer`) | Visualisasi grafik kepatuhan dan proporsi status |
| **Export Excel** | SheetJS (`xlsx.full.min.js` dengan `defer`) | Ekspor laporan mutu bulanan ke .xlsx |
| **Validasi Form** | Custom validation helper (`/js/utils/validator.js`) | Validasi data client-side (No RM, Usia, Waktu, dsb.) |
| **Date/Time** | Native `Date` API (Format ISO UTC) | Mencegah timezone shift di sisi client/server |
| **Notifikasi & Modal** | Custom toast (`toast.js`) & Modal (`modal.js`) | UI Feedback reusable tanpa library eksternal |

### 2.2 Backend

| Kategori | Pilihan | Keterangan |
|---|---|---|
| **Runtime** | Node.js 20 LTS | Runtime JavaScript server-side |
| **Framework** | Express.js 5.x | Web framework ringan untuk REST API |
| **Compression** | Express `compression` middleware | Mengompresi payload HTTP (JSON, CSS, JS) dengan Gzip/Brotli |
| **ORM** | Prisma ORM 6.x | Database ORM dengan schema-driven approach |
| **Autentikasi** | JWT (`jsonwebtoken`) | Access token 8 jam + Refresh token 7 hari |
| **Validasi** | `express-validator` | Validasi skema request di sisi server |
| **Password** | `bcryptjs` | Hashing password pengguna dengan salt |
| **Upload File** | Multer | Impor data Excel migrasi |
| **Parsing Excel** | SheetJS (`xlsx` & `exceljs`) | Pemrosesan file Excel di sisi server |
| **Logger** | Morgan + Winston | Logging request HTTP dan sistem audit |

### 2.3 Database

| Kategori | Pilihan | Keterangan |
|---|---|---|
| **Utama** | MariaDB / MySQL | Relational Database Management System |
| **Koneksi** | Prisma Client (`@prisma/client`) | ORM Client tergenerasi |
| **Indexing** | 47 Composite Indexes | Indexing `@@index([periode_id, unit_id])` pada seluruh tabel indikator |

### 2.4 Infrastructure

| Kategori | Pilihan |
|---|---|
| **Deployment** | Docker + Docker Compose |
| **Web Server** | Nginx (serve file statis frontend + reverse proxy ke API) |
| **Environment** | `.env` file per environment |
| **SSL** | Nginx + Let's Encrypt (production) |

---

## 3. Cakupan 57+ Modul Indikator Mutu

Aplikasi SIMURS mencakup 57+ modul indikator mutu pelayanan yang terbagi ke dalam 14 kategori utama:

1. **🛡️ Keselamatan Pasien**: Risiko Jatuh, Insiden Keselamatan, Identifikasi Pasien, Reaksi Transfusi, Gelang Identitas, Serah Terima Pasien, Kepatuhan Kebersihan Tangan, Kepatuhan Penggunaan APD.
2. **🏥 Rawat Inap**: Angka Kematian Ranap, Double Check High Alert, Visit Dokter Spesialis, Kembali ICU < 72 Jam, Alur Klinis (Clinical Pathway).
3. **🚨 IGD**: Waktu Tanggap SC Emergency, Emergency Response Time, Angka Kematian IGD, Asesmen Awal IGD, Pasien Tertahan IGD.
4. **💉 Hemodialisa (HD)**: Ketidakpatuhan Pasien HD, Insiden Clotting Durante HD, Insiden Jarum Vena Fistula.
5. **🔪 Operasi & Anestesi**: Penundaan Operasi Elektif, Informed Consent Bedah, Informed Consent Anestesi, Asesmen Pra Bedah, Asesmen Pra Anestesi, Surgical Safety Checklist SC, Surgical Safety Checklist Operasi, Penandaan Lokasi Operasi, Standar Minimal Mutu Kamar Operasi.
6. **🥗 Gizi**: Ketepatan Waktu Pemberian Makanan, Sisa Makanan Yang Tidak Termakan, Akurasi Pemberian Diet, Kepatuhan Identifikasi Pasien (SIMRS).
7. **💊 Farmasi**: Standar Minimal Mutu Farmasi, Kesalahan Penyerahan Obat, Kepatuhan Formularium Nasional.
8. **🩺 Rawat Jalan**: Waktu Tunggu Poliklinik, Waktu Tunggu Operasi Elektif.
9. **📄 Rekam Medis**: Standar Minimal Mutu Rekam Medis.
10. **♿ Rehabilitasi Medis**: Drop Out Pasien, Tidak Adanya Kejadian Kesalahan Tindakan, Waktu Tunggu Pelayanan Rehab, Kepatuhan Identitas Pasien, Kepuasan Pasien Rehab.
11. **🧺 Laundry**: Ketepatan Waktu Penyediaan Linen Bersih, Tidak Adanya Kejadian Linen Hilang.
12. **🩻 Radiologi**: Jadwal Dokter Radiologi, Waktu Tunggu Thorax Sesuai Jadwal, Waktu Tunggu Thorax Diluar Jadwal, Kejadian Foto Ulang Pasien, Kelengkapan Info Tindakan, Kepatuhan Identifikasi Pasien.
13. **🧪 Laboratorium**: Jadwal Dokter Laboratorium, Waktu Tunggu Lab < 140 Menit, Waktu Tunggu Lab > 140 Menit, Pelaporan Hasil Kritis Lab ≤ 30 Menit, Tidak Adanya Kesalahan Input Lab, Tidak Adanya Kerusakan Sampel Lab, Kepatuhan Identifikasi Pasien Lab, Data Ekspertisi Oleh Dokter Lab.
14. **💻 SIMRS IT**: Response Time SIMRS IT.

---

## 4. Pola Arsitektur Frontend (Vanilla JS)

### 4.1 SPA Router (Hash-based)

File `js/router.js` menangani navigasi SPA tanpa reload halaman:

```javascript
const routes = {
  '#/login':                      { module: () => import('./pages/login.js'), title: 'Login' },
  '#/dashboard':                  { module: () => import('./pages/dashboard.js'), title: 'Dashboard' },
  '#/laporan':                    { module: () => import('./pages/laporan.js'), title: 'Cetak Laporan' },
  '#/modul':                      { module: () => import('./pages/modul-grid.js'), title: 'Daftar Modul' },
  '#/risiko-jatuh':               { module: () => import('./pages/modules/risiko-jatuh.js'), title: 'Risiko Jatuh' },
  // ... 57+ modul indikator
  '#/admin/users':                { module: () => import('./pages/admin/users.js'), title: 'Kelola Pengguna' },
  '#/admin/units':                { module: () => import('./pages/admin/units.js'), title: 'Kelola Unit' },
  '#/admin/periode':              { module: () => import('./pages/admin/periode.js'), title: 'Kelola Periode' },
  '#/admin/audit-log':            { module: () => import('./pages/admin/audit-log.js'), title: 'Audit Trail' },
};
```

### 4.2 Global Store

File `js/store.js` menyimpan state yang dibagikan antar halaman:

```javascript
const Store = {
  user: null,          // { id, nama, role, unit_id }
  periodeAktif: null,  // { id, bulan, tahun }
  unitAktif: null,     // { id, nama_unit }
  token: null,
  indicatorSummariesCache: null, // Short-lived in-memory cache

  clearSummaryCache() { this.indicatorSummariesCache = null; },
  set(key, value) {
    this[key] = value;
    if (key === 'periodeAktif' || key === 'unitAktif') this.clearSummaryCache();
  },
  get(key) { return this[key]; },
  clear() { /* ... reset state & storage ... */ }
};
```

---

## 5. Fitur Utama & Keamanan

1. **Role-Based Access Control (RBAC) & Granular Assignment**: Pembatasan hak akses menu & modul per user yang ditentukan secara dinamis oleh Admin melalui checklist.
2. **Penguncian Periode (Data Locking)**: Setelah periode ditutup (`closed`), seluruh data pada periode tersebut otomatis terkunci dan tidak dapat diubah/dihapus demi integritas laporan.
3. **Audit Trail**: Pencatatan riwayat transaksi `create`, `update`, `delete` secara otomatis ke tabel `audit_log`.
4. **Validasi Skema Server & Client**: Validasi berlapis untuk menjamin integritas data (No RM, Usia, Waktu, Enum) sebelum masuk ke database.