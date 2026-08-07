# Product Requirements Document (PRD)
## Sistem Informasi Mutu Rumah Sakit (SIMURS)
### Versi Vanilla JS

**Versi:** 1.3.0  
**Tanggal:** Agustus 2026  
**Status:** Updated & Production-Ready  

---

## 1. Overview

### 1.1 Latar Belakang

Pencatatan data indikator mutu rumah sakit sebelumnya dilakukan secara manual menggunakan file Excel (.xlsx) dengan puluhan sheet terpisah, mencakup indikator keselamatan pasien, pelayanan klinis, IGD, hemodialisa, operasi, gizi, farmasi, radiologi, laboratorium, rekam medis, rehabilitasi medis, laundry, dan SIMRS IT. Proses manual ini rentan kesalahan input, tidak memiliki validasi otomatis, sulit diakses banyak pengguna secara bersamaan, dan menyulitkan pelaporan agregat bulanan.

### 1.2 Tujuan Produk

Membangun aplikasi web berbasis Vanilla JS (tanpa framework frontend) untuk input, penyimpanan, dan pelaporan data mutu rumah sakit yang:
- Menggantikan pencatatan manual di Excel dengan **82+ Modul Indikator Mutu Terintegrasi**.
- Menyediakan validasi data secara real-time (client-side & server-side) dengan fitur konversi tipe data otomatis (*type coercion*).
- Menghitung nilai kepatuhan dan indikator mutu secara otomatis.
- Menyediakan modul **Rekap Data Mutu Matrix** untuk melihat agregasi bulanan, triwulan, dan semester per unit kerja maupun total rumah sakit.
- Menyediakan modul **Import Data Massal** untuk migrasi data Excel dengan validasi skema database tingkat lanjut.
- Menyediakan modul **Kelola Indikator Unit** untuk penugasan & pengaktifan indikator mutu per unit/ruangan secara fleksibel.
- Menghasilkan laporan bulanan yang dapat diekspor ke Excel (.xlsx) dan PDF / Cetak secara presisi.
- Dapat diakses multi-user sesuai peran (Role-Based Access Control) dengan granularitas penugasan unit dan checklist modul.
- Ringan, cepat, responsif, dan tidak memerlukan proses build/compile di sisi frontend.

### 1.3 Stakeholder & Pengguna

| Peran | Level Akses | Hak Akses / Fungsionalitas Utama |
|---|---|---|
| **Admin** | Administrator | Hak akses penuh: CRUD seluruh data indikator, kelola pengguna (tambah, edit, hapus, checklist akses modul), kelola unit kerja, kelola indikator unit, penguncian periode (buka & tutup periode), impor data massal Excel, kelola informasi RS, serta menelusuri log audit (Audit Trail). |
| **Komite Mutu** | Evaluator / Auditor | Monitoring dashboard kinerja interaktif, akses modul Rekap Data Mutu matrix (bulanan/triwulan/semester), penyaringan pencapaian indikator, pengawasan audit trail, serta ekspor dan pencetakan laporan bulanan/tahunan. |
| **PIC Mutu** | Operator Terbatas | Mengisi dan mereview data indikator mutu di ruangan/unit kerja yang ditugaskan. Hak akses modul dibatasi secara granular oleh Admin melalui checklist pengguna. |
| **Petugas** | Operator Terbatas | Mengisi data indikator mutu di ruangan/unit kerja yang ditugaskan. Hak akses modul dibatasi secara granular oleh Admin melalui checklist pengguna. |

---

## 2. Tech Stack

### 2.1 Frontend (Vanilla JS — tanpa framework)

| Kategori | Pilihan | Keterangan |
|---|---|---|
| **Bahasa** | HTML5 + CSS3 + JavaScript (ES6+ Modules) | Tanpa transpiler, dijalankan langsung oleh browser |
| **Styling** | Vanilla CSS (Custom Properties + Flexbox/Grid) | Design system kustom dengan Glassmorphism, Dark/Light theme, & variabel responsif |
| **Routing** | Hash-based SPA router (custom, `router.js`) | Navigasi `#/dashboard`, `#/rekap-mutu`, `#/risiko-jatuh`, dll — tanpa library eksternal |
| **HTTP Client** | Native `fetch()` API (`client.js`) | Wrapper terpusat dengan auto-auth header, handling token refresh, auto cache-invalidation, & error handling |
| **State Management** | Global Store (`store.js`) | Menyimpan state user, periode, unit, dan `indicatorSummariesCache` untuk navigasi instan (0 ms) |
| **Chart** | Chart.js (CDN dengan tag `defer`) | Visualisasi grafik kepatuhan dan proporsi status (Tercapai, Belum Tercapai, Belum Ada Data) |
| **Export Excel** | SheetJS (`xlsx.full.min.js` dengan `defer`) | Ekspor laporan mutu bulanan & matrix rekap mutu ke .xlsx |
| **UI Components** | Custom Generic Indicator Page (`createGenericIndicatorPage`) | Factory function frontend untuk pembuatan halaman indikator secara instan dan standar |
| **Validasi Form** | Custom validation helper (`/js/utils/validator.js`) | Validasi data client-side (No RM, Usia, Waktu, Format ISO, dsb.) |
| **Notifikasi & Modal** | Custom toast (`toast.js`) & Modal (`modal.js`) | UI Feedback reusable tanpa library eksternal |

### 2.2 Backend

| Kategori | Pilihan | Keterangan |
|---|---|---|
| **Runtime** | Node.js 20 LTS | Runtime JavaScript server-side |
| **Framework** | Express.js 5.x | Web framework ringan untuk REST API |
| **Compression** | Express `compression` middleware | Mengompresi payload HTTP (JSON, CSS, JS) dengan Gzip/Brotli (penghematan bandwidth 70%-80%) |
| **ORM** | Prisma ORM 6.x | Database ORM dengan schema-driven approach |
| **Autentikasi** | JWT (`jsonwebtoken`) | Access token 8 jam + Refresh token 7 hari |
| **Validasi** | `express-validator` & `generic.service.js` | Validasi skema request & konversi tipe data otomatis (enum, boolean, integer, Date) |
| **Password** | `bcryptjs` | Hashing password pengguna dengan salt |
| **Upload File** | Multer | Impor data massal file Excel |
| **Parsing & Generator Excel** | SheetJS (`xlsx`) & `exceljs` | Pemrosesan impor Excel & pembuatan file ekspor matrix berwarna |
| **Logger** | Morgan + Winston | Logging request HTTP dan sistem audit |

### 2.3 Database

| Kategori | Pilihan | Keterangan |
|---|---|---|
| **Utama** | MariaDB / MySQL | Relational Database Management System |
| **Koneksi** | Prisma Client (`@prisma/client`) | ORM Client tergenerasi |
| **Indexing** | 47 Composite Indexes | Indexing `@@index([periode_id, unit_id])` pada seluruh tabel indikator untuk pencarian data instan |

### 2.4 Infrastructure

| Kategori | Pilihan |
|---|---|
| **Deployment** | Docker + Docker Compose |
| **Web Server** | Nginx (serve file statis frontend + reverse proxy ke API) |
| **Environment** | `.env` file per environment |
| **SSL** | Nginx + Let's Encrypt (production) |

---

## 3. Cakupan 82+ Modul Indikator Mutu

Aplikasi SIMURS mencakup **82+ indikator mutu pelayanan** yang terdaftar pada sistem dan terbagi ke dalam 14 kategori utama:

1. **🛡️ Keselamatan Pasien (8 Indikator)**:
   - Angka Kejadian Reaksi Transfusi (`≤ 0.01%`)
   - Kepatuhan Identifikasi Pasien (`100%`)
   - Kepatuhan Upaya Pencegahan Risiko Pasien Jatuh (`100%`)
   - Pemasangan Gelang Identitas (`100%`)
   - Kesesuaian Pelaksanaan Serah Terima Pasien (`100%`)
   - Kepatuhan Kebersihan Tangan (`≥ 85%`)
   - Kepatuhan Penggunaan APD (`100%`)
   - Insiden Keselamatan Pasien (`0%`)

2. **🏥 Rawat Inap (5 Indikator)**:
   - Kejadian Pasien Meninggal di Rawat Inap (`0%`)
   - Kepatuhan Pelaksanaan Double Check Obat High Alert (`≥ 80%`)
   - Kepatuhan Visit Dokter Spesialis (`≥ 80%`)
   - Rata-rata Kembali Rawat Intensif < 72 jam (`-`)
   - Kepatuhan Terhadap Alur Klinis / Clinical Pathway (`≥ 80%`)

3. **🚨 IGD (5 Indikator)**:
   - Waktu Tanggap Operasi Seksio Sesarea Emergency (`≥ 80%`)
   - Waktu Tanggap Pelayanan Dokter di Gawat Darurat (`≤ 5 menit`)
   - Angka Kematian Pasien di IGD (`-`)
   - Kelengkapan Asesmen Awal IGD (`100%`)
   - Pasien Tertahan di IGD (`-`)

4. **💉 Hemodialisa / HD (4 Indikator)**:
   - Ketidakpatuhan Pasien Tentang Jadwal Hemodialisa (`-`)
   - Insiden Clotting Durante HD (`-`)
   - Insiden Terlepaskan Jarum Vena Fistula Intra Dialysis (`0%`)
   - Insiden Pasien Jatuh Hemodialisis (`0%`)

5. **🔪 Operasi & Anestesi (14 Indikator)**:
   - Penundaan Operasi Elektif (`≤ 5%`)
   - Kelengkapan Pengisian Informed Consent Pembedahan (`100%`)
   - Kelengkapan IC Tindakan Anestesi Sedasi (`100%`)
   - Angka Kelengkapan Asesmen Pra Bedah (`100%`)
   - Kelengkapan Asesmen Pre Anestesi Sedasi (`100%`)
   - Kepatuhan Melakukan Proses TimeOut Pasien Operasi SC (`100%`)
   - Kepatuhan Melakukan Proses TimeOut Pasien Pre Operasi (`100%`)
   - 100% Pasien Yang Dioperasi Ada Marker / Penandaan Lokasi Operasi (`100%`)
   - Kejadian Kematian di Meja Operasi (`0%`)
   - Kejadian Operasi Salah Sisi (`0%`)
   - Kejadian Operasi Salah Pasien (`0%`)
   - Kejadian Operasi Salah Prosedur Tindakan (`0%`)
   - Kelengkapan Laporan Anestesi Sedasi (`100%`)
   - Standar Minimal Mutu Kamar Operasi (`100%`)

6. **🥗 Gizi (4 Indikator)**:
   - Ketepatan Waktu Pemberian Makan Pada Pasien (`≥ 90%`)
   - Sisa Makanan Yang Tidak Termakan Oleh Pasien (`≤ 20%`)
   - Tidak Adanya Kejadian Salah Pemberian Diet Pasien (`100%`)
   - Penulisan Pasien di SIMRS Sesuai Ruangan, Bed, RM, Diet Pasien (`≥ 85%`)

7. **💊 Farmasi (10 Indikator)**:
   - Angka Kejadian Ketidaktersediaan Obat di Farmasi Rawat Jalan (`≤ 5%`)
   - Angka Kejadian Ketidaktersediaan Obat di Farmasi Rawat Inap (`≤ 5%`)
   - Tidak Adanya Kejadian Kesalahan Pemberian Obat Pasien Rawat Jalan (`0%`)
   - Tidak Adanya Kejadian Kesalahan Pemberian Obat Pasien Rawat Inap (`0%`)
   - Tidak Adanya Kejadian Kesalahan Pemberian Obat Pasien IGD (`0%`)
   - Total Kesalahan Pemberian Obat Pasien Rawat Jalan, Inap, dan IGD (`0%`)
   - Waktu Tunggu Obat Racikan (`≤ 60 Menit`)
   - Rata-rata Waktu Tunggu Obat Racikan Dalam Menit (`-`)
   - Waktu Tunggu Obat Non Racikan (`≤ 30 Menit`)
   - Rata-rata Waktu Tunggu Obat Non Racikan Dalam Menit (`-`)
   - Kepatuhan Penggunaan Formularium Nasional (`≥ 80%`)
   - Kepatuhan Pelaksanaan Double Check Obat High Alert Farmasi (`≥ 80%`)

8. **🚶 Rawat Jalan (4 Indikator)**:
   - Waktu Tunggu Rawat Jalan dalam Menit (`Menit`)
   - Waktu Tunggu Rawat Jalan dalam Jam (`≤ 1 Jam`)
   - Kepatuhan Waktu Tunggu Rawat Jalan (`≥ 80%`)
   - Rata-rata Waktu Tunggu Poliklinik (`-`)

9. **📄 Rekam Medis (5 Indikator)**:
   - Kelengkapan Dokumen Rekam Medis Pasien Ranap (`100%`)
   - Standar Pengembalian & Pengisian Dok RM 1 x 24 Jam (`1x24 Jam`)
   - Pemberian Informasi Antrian Online (`85%`)
   - Ketepatan Coding Rawat Inap & Rawat Jalan (`100%`)
   - Antrian Mobile JKN (`30%`)

10. **♿ Rehabilitasi Medis (5 Indikator)**:
    - Kejadian Drop Out Pasien Terhadap Pelayanan Rehabilitasi Medis (`≤ 50%`)
    - Tidak Adanya Kejadian Kesalahan Tindakan Rehabilitasi Medis (`100%`)
    - Waktu Tunggu Pelayanan Rawat Jalan Rehabilitasi Medis (`≤ 60 menit`)
    - Kepatuhan Identifikasi Pasien Rehab (`100%`)
    - Kepuasan Pasien Pelayanan Rehabilitasi Medis (`≥ 80%`)

11. **🧺 Laundry & Sterilisasi (4 Indikator)**:
    - Tidak Adanya Kejadian Linen Yang Hilang (`100%`)
    - Ketepatan Waktu Penyediaan Linen Untuk Ruang Rawat Inap (`100%`)
    - Ketepatan Waktu Penyediaan Instrumen Operasi Siap Pakai (`100%`)
    - Kesesuaian Prosedur Sterilisasi Alat-Alat Medis (`100%`)

12. **🩻 Radiologi (6 Indikator)**:
    - Jadwal Dokter Radiologi (`100%`)
    - Waktu Tunggu Hasil Pelayanan Foto Thorax Sesuai Jadwal (`< 3 Jam`)
    - Waktu Tunggu Hasil Pelayanan Foto Thorax Diluar Jadwal (`> 3 Jam`)
    - Kejadian Foto Ulang Pasien (`-`)
    - Kelengkapan Pengisian Form Info Tindakan Radiologi (`≥ 85%`)
    - Kepatuhan Identifikasi Pasien Radiologi (`100%`)

13. **🧪 Laboratorium (9 Indikator)**:
    - Jadwal Dokter Laboratorium (`100%`)
    - Waktu Tunggu Hasil Pemeriksaan Lab Clinic (`<= 140 Menit`)
    - Waktu Tunggu Hasil Pemeriksaan Lab Clinic (`>= 140 Menit`)
    - Jumlah Dalam Menit Per Pasien Lab (`-`)
    - Pelaporan Hasil Kritis Laboratorium (`≤ 30 menit`, `100%`)
    - Tidak Adanya Kesalahan Input Data Hasil Lab (`100%`)
    - Tidak Adanya Kerusakan Sampel di Laboratorium (`100%`)
    - Kepatuhan Identifikasi Pasien Lab (`100%`)
    - Ekspertisi Oleh Dokter Spesialis Patologi Klinik (`100%`)
    - Tidak Adanya Kesalahan Penyerahan Hasil Lab (`100%`)

14. **💻 SIMRS IT (1 Indikator)**:
    - Response Time SIMRS IT (`≤ 15 Menit`)

---

## 4. Pola Arsitektur Frontend (Vanilla JS)

### 4.1 SPA Router (Hash-based)

File `js/router.js` menangani navigasi SPA tanpa reload halaman dengan dynamic module import:

```javascript
const routes = {
  '#/login':                      { module: () => import('./pages/login.js'), title: 'Login' },
  '#/dashboard':                  { module: () => import('./pages/dashboard.js'), title: 'Dashboard' },
  '#/laporan':                    { module: () => import('./pages/laporan.js'), title: 'Cetak Laporan' },
  '#/rekap-mutu':                 { module: () => import('./pages/rekap-mutu.js'), title: 'Rekap Data Mutu' },
  '#/modul':                      { module: () => import('./pages/modul-grid.js'), title: 'Daftar Modul' },
  '#/risiko-jatuh':               { module: () => import('./pages/modules/risiko-jatuh.js'), title: 'Risiko Jatuh' },
  // ... 82+ modul indikator
  '#/admin/users':                { module: () => import('./pages/admin/users.js'), title: 'Kelola Pengguna' },
  '#/admin/units':                { module: () => import('./pages/admin/units.js'), title: 'Kelola Unit' },
  '#/admin/unit-indicator-config':{ module: () => import('./pages/admin/unit-indicator-config.js'), title: 'Kelola Indikator Unit' },
  '#/admin/periode':              { module: () => import('./pages/admin/periode.js'), title: 'Kelola Periode' },
  '#/admin/import-data':          { module: () => import('./pages/admin/import-data.js'), title: 'Import Data Massal' },
  '#/admin/informasi-rs':         { module: () => import('./pages/admin/informasi-rs.js'), title: 'Informasi Rumah Sakit' },
  '#/admin/audit-log':            { module: () => import('./pages/admin/audit-log.js'), title: 'Audit Trail' },
};
```

### 4.2 Global Store & In-Memory Summary Cache

File `js/store.js` menyimpan state terpusat untuk aplikasi:

```javascript
const Store = {
  user: null,          // { id, nama, role, unit_id }
  periodeAktif: null,  // { id, bulan, tahun }
  unitAktif: null,     // { id, nama_unit }
  token: null,
  indicatorSummariesCache: null, // Short-lived in-memory summary cache

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

1. **Role-Based Access Control (RBAC) & Granular Assignment**: Pembatasan hak akses menu & modul per user yang ditentukan secara dinamis oleh Admin melalui checklist pengguna. Modul yang tidak dicentang otomatis disembunyikan dari sidebar dan diblokir oleh Router.
2. **Penguncian Periode (Data Locking)**: Setelah periode ditutel/ditutup (`closed`), seluruh data pada periode tersebut otomatis terkunci dan tidak dapat diubah/dihapus demi integritas laporan.
3. **Rekap Data Mutu Matrix**: Modul agregasi matrix kepatuhan bulanan, triwulan, dan semester per unit kerja maupun total rumah sakit, dilengkapi fungsi ekspor file Excel (.xlsx) dengan skema warna bulanan dinamis (*month color palette*).
4. **Import Data Massal Excel**: Kemampuan mengunggah file Excel berisi banyak sheet indikator sekaligus dengan pencocokan nama sheet, otomatisasi pengisian `periode_id` aktif dan `created_by`, serta validasi tipe data server-side (*type coercion*).
5. **Konfigurasi Indikator Unit**: Fitur per unit untuk menentukan indikator mana saja yang aktif dan berlaku untuk ruangan/unit kerja tertentu.
6. **Audit Trail**: Pencatatan riwayat transaksi `create`, `update`, `delete` secara otomatis ke tabel `audit_log`.
7. **Validasi Skema Server & Client**: Validasi berlapis untuk menjamin integritas data (No RM, Usia, Waktu, Enum) sebelum masuk ke database.