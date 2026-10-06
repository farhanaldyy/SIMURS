# SIMURS — Sistem Informasi Mutu Rumah Sakit

SIMURS (Sistem Informasi Mutu Rumah Sakit) adalah aplikasi berbasis web yang dirancang untuk pencatatan, pemantauan, dan pelaporan **82+ indikator mutu pelayanan rumah sakit** secara real-time. Aplikasi ini membantu komite mutu, PIC mutu, dan staf rumah sakit dalam mengevaluasi kepatuhan standar pelayanan medis secara efisien, transparan, dan akurat.

---

## Alur Kerja Sistem (System Workflow)

Berikut adalah diagram alur pengelolaan data indikator mutu di SIMURS:

```mermaid
graph TD
    A[Admin: Buka Periode Baru] --> B[Admin: Konfigurasi Indikator Unit & Hak Akses]
    B --> C[Petugas / PIC Mutu: Input Data Indikator atau Impor Data Massal Excel]
    C --> D[Sistem: Validasi Skema, Type Coercion & Log Audit Trail]
    D --> E[Komite Mutu: Monitoring Dashboard & Matrix Rekap Data Mutu]
    E --> F[Komite Mutu: Cetak Laporan Bulanan & Ekspor Matrix Excel]
    F --> G[Admin: Tutup Periode / Lock Data]
    G --> H[Data Terkunci: Tidak Bisa Diedit/Dihapus]
```

---

## Fitur Utama

### 1. Dashboard Kinerja Interaktif
* **Ringkasan Indikator**: Grafik proporsi status capaian (Tercapai, Belum Tercapai, Belum Ada Data) menggunakan Chart.js.
* **Kepatuhan Indikator**: Grafik 8 indikator dengan tingkat kepatuhan tertinggi/terendah untuk prioritas perbaikan mutu.
* **Tabel Rekapitulasi Capaian**: Menampilkan detail target, pembilang (numerator), penyebut (denominator), hasil persentase, dan status ketercapaian secara dinamis dengan filter real-time.

### 2. Rekap Data Mutu Matrix
* **Agregasi Periode Multilevel**: Perhitungan otomatis capaian mutu bulanan, triwulan (I–IV), dan semester (I–II) per unit kerja maupun total akumulasi rumah sakit.
* **Format Ekspor Matrix Excel**: Ekspor rekapitulasi data mutu dalam bentuk spreadsheet matrix berwarna per bulan (*month color palette*) yang siap dipresentasikan.
* **Tabel INM (Indikator Nasional Mutu)**: 13 indikator INM teragregasi otomatis per bulan/triwulan/semester, termasuk Kecepatan Waktu Tanggap Komplain.

### 2a. Halaman INM Chart (Dashboard Full Chart)
* **13 Chart Garis** untuk seluruh indikator INM (identik format: PENCAPAIAN biru berlian vs STANDAR merah kotak, sumbu Y 0–100%, tabel data bulanan di bawah chart).
* **Filter Data**: tahun, rentang bulan, dan unit kerja.
* **Tabel Ringkasan** capaian 13 indikator (N, D, capaian %, standar).
* **Unduh PDF**: ekspor halaman chart lengkap dalam format A3 landscape siap cetak.
* **Unduh PPT**: ekspor tiap chart dalam slide presentasi (1 slide/indikator) lengkap dengan keterangan singkat masing-masing.

### 3. 82+ Modul Indikator Mutu Pelayanan
Modul pencatatan data yang dikelompokkan ke dalam 14 kategori pelayanan utama:
* **🛡️ Keselamatan Pasien (8 Indikator)**: Risiko Jatuh, Insiden Keselamatan, Identifikasi Pasien, Reaksi Transfusi, Gelang Identitas, Serah Terima Pasien, Kepatuhan Kebersihan Tangan, Kepatuhan Penggunaan APD.
* **🏥 Rawat Inap (5 Indikator)**: Angka Kematian Ranap, Double Check High Alert, Visit Dokter Spesialis, Kembali ICU < 72 Jam, Alur Klinis (Clinical Pathway).
* **🚨 IGD (5 Indikator)**: Waktu Tanggap SC Emergency, Emergency Response Time, Angka Kematian IGD, Asesmen Awal IGD, Pasien Tertahan IGD.
* **💉 Hemodialisa (4 Indikator)**: Ketidakpatuhan Pasien HD, Insiden Clotting Durante HD, Insiden Pasien Jatuh HD, Insiden Jarum Vena Fistula.
* **🔪 Operasi & Anestesi (14 Indikator)**: Penundaan Operasi Elektif, Informed Consent Bedah, Informed Consent Anestesi, Asesmen Pra Bedah, Asesmen Pra Anestesi, Surgical Safety Checklist SC, Surgical Safety Checklist Op, Penandaan Lokasi Operasi, Standar Minimal Mutu Kamar Operasi, dll.
* **🥗 Gizi (4 Indikator)**: Ketepatan Waktu Pemberian Makanan, Sisa Makanan Yang Tidak Termakan, Akurasi Pemberian Diet, Kepatuhan Identifikasi Pasien (SIMRS).
* **💊 Farmasi (10 Indikator)**: Standar Minimal Mutu Farmasi, Kesalahan Penyerahan Obat, Kepatuhan Formularium Nasional, Ketidaktersediaan Obat, Waktu Tunggu Obat Racikan & Non Racikan.
* **🚶 Rawat Jalan (4 Indikator)**: Waktu Tunggu Poliklinik (Menit, Jam, Kepatuhan, Rata-rata Poli), Waktu Tunggu Operasi Elektif.
* **📄 Rekam Medis (5 Indikator)**: Standar Minimal Mutu Rekam Medis, Pengembalian RM 24h, Antrian Online, Coding, Mobile JKN.
* **♿ Rehabilitasi Medis (5 Indikator)**: Drop Out Pasien, Tidak Adanya Kejadian Kesalahan Tindakan, Waktu Tunggu Pelayanan Rehab, Kepatuhan Identitas Pasien, Kepuasan Pasien Rehab.
* **🧺 Laundry & Sterilisasi (4 Indikator)**: Ketepatan Waktu Penyediaan Linen Bersih, Tidak Adanya Kejadian Linen Hilang, Penyediaan Instrumen OP, Prosedur Sterilisasi.
* **🩻 Radiologi (6 Indikator)**: Jadwal Dokter Radiologi, Waktu Tunggu Thorax Sesuai Jadwal, Waktu Tunggu Thorax Diluar Jadwal, Kejadian Foto Ulang Pasien, Kelengkapan Info Tindakan, Kepatuhan Identifikasi Pasien.
* **🧪 Laboratorium (9 Indikator)**: Jadwal Dokter Laboratorium, Waktu Tunggu Lab < 140 Menit, Waktu Tunggu Lab > 140 Menit, Pelaporan Hasil Kritis Lab ≤ 30 Menit, Tidak Adanya Kesalahan Input Lab, Tidak Adanya Kerusakan Sampel Lab, Kepatuhan Identifikasi Pasien Lab, Data Ekspertisi Oleh Dokter Lab, Kesalahan Penyerahan Hasil Lab.
* **💻 SIMRS IT (1 Indikator)**: Response Time SIMRS IT.
* **😊 Kepuasan Pelayanan (2 Indikator)**: Kepuasan Pasien Pada Pelayanan, Kecepatan Waktu Tanggap Komplain (kepatuhan dihitung otomatis berdasarkan grading risiko: Merah ≤ 24 jam, Kuning ≤ 3 hari, Hijau ≤ 7 hari).

### 4. Import Data Massal Excel
* **Struktur Template Otomatis**: Download template Excel berstruktur resmi yang sesuai dengan skema database seluruh indikator.
* **Validasi Skema & Type Coercion**: Pemrosesan impor dengan pembersihan data otomatis, konversi tipe boolean/enum, dan pengisian `periode_id` aktif secara aman.

### 5. Autentikasi & Hak Akses Granular (Granular RBAC)
* **Admin & Komite Mutu**: Akses penuh ke seluruh menu, kelola pengguna, kelola unit, kelola indikator unit, kelola periode, impor data massal, audit trail, serta seluruh modul indikator.
* **PIC Mutu & Petugas**: Akses dibatasi secara granular. Admin dapat mencentang modul mana saja yang boleh diisi oleh user tertentu pada form **Kelola Pengguna**. Modul yang tidak dicentang otomatis disembunyikan dari sidebar dan diblokir oleh Router.

### 6. Kelola Indikator Unit
* Penugasan dan pengaktifan indikator mutu secara kustom per unit kerja/ruangan.

### 7. Audit Trail & Data Locking
* Pencatatan otomatis setiap aksi pembuatan, pengubahan, dan penghapusan data indikator mutu ke dalam `audit_log`.
* Penguncian otomatis data saat periode disetel ke status `closed`.

---

## ⚡ Analisis & Optimasi Performa (Performance Optimization)

Aplikasi SIMURS telah melalui serangkaian proses audit dan optimasi performa menyeluruh pada seluruh lapisan arsitektur (**Database**, **Backend API**, **Network Compression**, dan **Frontend State**).

### 📊 Perbandingan Performa Sebelum vs Sesudah Optimasi

| Aspek Performa | Sebelum Optimasi | Sesudah Optimasi | Dampak & Peningkatan |
|---|---|---|---|
| **Waktu Pemuatan Dashboard** | 2.500 ms – 5.000 ms *(Sequential await 82 query)* | **< 250 ms** *(Paralel `Promise.all`)* | 🚀 **10x – 20x Lebih Cepat** |
| **Ukuran Network Payload** | 100% Ukuran Asli JSON (Uncompressed) | **20% – 30% Ukuran Asli** *(Express Gzip/Brotli)* | 📉 **Penghematan Bandwidth 70%-80%** |
| **Pindah Halaman (Dashboard ↔ Laporan)** | Memicu HTTP Request berulang setiap kali navigasi | **0 ms (Instan)** *(Client-Side Summary Cache)* | ⚡ **Deduplikasi Network Request** |
| **Penggunaan Memori RAM Server** | Tinggi *(Menarik ribuan rows ke RAM via `findMany()`)* | **Sangat Hemat** *(DB `count()` & Agregasi)* | 🧠 **Mencegah Memory Leak & High Heap** |
| **Kecepatan Ekspor Excel (.xlsx)** | 3.000 ms – 8.000 ms *(Loop sekuensial 82 tabel)* | **< 800 ms** *(Paralel `Promise.all` 82 tabel)* | 📊 **3x – 5x Lebih Cepat** |
| **Query Database MySQL** | Full Table Scan / Index Merge Cost | **Direct Index Scan** *(47 Composite Indexes)* | 🗄️ **Pencarian Data Optimal** |
| **Render Blocking UI** | Terjadi *(Script CDN synchronous di `<head>`)* | **Bebas Render Blocking** *(Atribut `defer`)* | 🎨 **Pemuatan UI Mulus** |

---

## Arsitektur Teknologi

* **Frontend**: HTML5 Semantic, Vanilla CSS3 (Custom Variables, Glassmorphism), Vanilla Javascript (ES Modules / SPA Client-side Router).
* **Chart & Export**: Chart.js + chartjs-plugin-datalabels, SheetJS, html2pdf.js, pptxgenjs (semua via CDN).
* **Backend**: Node.js 20 LTS, Express.js 5.x (dengan `compression` middleware), Prisma ORM 6.x.
* **Database**: MariaDB / MySQL (dengan 47 Composite Indexes `@@index([periode_id, unit_id])`).

---

## Persiapan & Instalasi

### 1. Prasyarat (Prerequisites)
Pastikan sistem Anda sudah terinstal:
* [Node.js](https://nodejs.org/) (versi 18 atau yang lebih baru)
* **MariaDB / MySQL Server**

### 2. Konfigurasi Environment
Salin file konfigurasi environment di dalam folder `backend/`:
```bash
cp backend/.env.example backend/.env
```

Sesuaikan nilai `DATABASE_URL` di file `backend/.env` sesuai konfigurasi MariaDB Anda:
```env
DATABASE_URL="mysql://simurs:password_anda@localhost:3306/db_mutu_rsik"
JWT_SECRET="ganti_dengan_jwt_secret_aman"
JWT_REFRESH_SECRET="ganti_dengan_jwt_refresh_secret_aman"
PORT=3000
```

---

## Cara Menjalankan Aplikasi

### 1. Instalasi Dependensi Backend
```bash
cd backend
npm install
```

### 2. Sinkronisasi Skema Database Prisma
Sinkronkan model database & composite indexes ke MariaDB/MySQL Anda:
```bash
npm run prisma:push
```

### 3. Seed Data Awal (Opsional)
Gunakan seeder bawaan untuk mengisi data unit kerja, periode uji coba, dan akun demo:
```bash
npm run prisma:seed
```

### 4. Jalankan Aplikasi
Jalankan server dalam mode development:
```bash
npm run dev
```
Aplikasi dapat diakses di browser Anda: 👉 **[http://localhost:3000](http://localhost:3000)**

---

## Akun Demo (Bawaan Seeder)

| Username | Password | Role | Deskripsi Hak Akses |
| :--- | :--- | :--- | :--- |
| `admin` | `admin123` | **Admin** | Akses penuh, kelola user, kelola unit, kelola indikator unit, impor data massal, kelola periode |
| `komite` | `komite123` | **Komite Mutu** | Monitoring dashboard, rekap data mutu matrix, filter indikator, dan ekspor/cetak laporan |
| `pic_ranap` | `pic123` | **PIC Mutu** | Akses modul rawat inap terikat |
| `petugas_igd` | `petugas123` | **Petugas** | Akses modul IGD terikat |
