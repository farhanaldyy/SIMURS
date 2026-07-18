# SIMURS — Sistem Informasi Mutu Rumah Sakit

SIMURS (Sistem Informasi Mutu Rumah Sakit) adalah aplikasi berbasis web yang dirancang untuk pencatatan, pemantauan, dan pelaporan 34 indikator mutu pelayanan rumah sakit secara real-time. Aplikasi ini membantu komite mutu dan staf rumah sakit dalam mengevaluasi kepatuhan standar pelayanan medis secara efisien dan transparan.

---

## Alur Kerja Sistem (System Workflow)

Berikut adalah diagram alur pengelolaan data indikator mutu di SIMURS:

```mermaid
graph TD
    A[Admin: Buka Periode Baru] --> B[Petugas / PIC Mutu: Input Data Indikator]
    B --> C[Sistem: Simpan Data & Log Aktivitas ke Audit Trail]
    C --> D[Komite Mutu: Monitoring Dashboard & Tren Capaian]
    D --> E[Komite Mutu: Cetak Laporan Bulanan/Tahunan]
    E --> F[Admin: Tutup Periode / Lock Data]
    F --> G[Data Terkunci: Tidak Bisa Diedit/Dihapus]
```

---

## Fitur Utama

### 1. Dashboard Kinerja Interaktif
* **Ringkasan Indikator**: Grafik proporsi status capaian (Tercapai, Belum Tercapai, Belum Ada Data) menggunakan Chart.js.
* **Top 8 Masalah**: Grafik 8 indikator dengan tingkat kepatuhan terendah untuk prioritas perbaikan mutu.
* **Tabel Rekapitulasi Capaian**: Menampilkan detail rumus, target, pembilang (numerator), penyebut (denominator), hasil persentase, dan status ketercapaian secara dinamis dengan filter real-time.

### 2. 34 Modul Indikator Mutu Pelayanan
Modul pencatatan data yang dikelompokkan ke dalam 6 kategori pelayanan utama:
* **🛡️ Keselamatan Pasien**: Risiko Jatuh, Insiden Keselamatan, Identifikasi Pasien, Reaksi Transfusi, Gelang Identitas, Kepatuhan Kebersihan Tangan, Kepatuhan Penggunaan APD.
* **🏥 Rawat Inap**: Angka Kematian Ranap, Double Check High Alert, Visit Dokter Spesialis, Kembali ICU, Alur Klinis.
* **🚨 IGD**: Waktu Tanggap SC, Emergency Response Time, Angka Kematian IGD, Asesmen Awal IGD, Pasien Tertahan IGD, Serah Terima Pasien.
* **💉 Hemodialisa**: Ketidakpatuhan Pasien HD, Insiden Clotting HD, Insiden Jarum Vena HD.
* **🔪 Operasi & Anestesi**: Penundaan Operasi Elektif, Informed Consent Bedah, Informed Consent Anestesi, Asesmen Pra Bedah, Asesmen Pra Anestesi, Surgical Safety Checklist SC, Surgical Safety Checklist Op, Penandaan Lokasi Operasi, Standar Minimal Mutu Kamar Operasi.
* **🥗 Gizi**: Ketepatan Waktu Makanan, Sisa Makanan Pasien, Akurasi Pemberian Diet, Identifikasi Pasien SIMRS.

### 3. Autentikasi & Hak Akses Granular (Granular RBAC)
* **Admin & Komite Mutu**: Akses penuh ke seluruh menu, kelola pengguna, kelola periode, audit trail, serta semua modul indikator.
* **PIC Mutu & Petugas**: Akses dibatasi secara granular. Admin dapat mencentang modul mana saja yang boleh diisi oleh user tertentu pada form **Kelola Pengguna**. Modul yang tidak dicentang otomatis disembunyikan dari sidebar dan diblokir oleh Router.

### 4. Smart Data Entry & Validasi
* **Pilihan Bulan & Ruangan Pintar**: Input bulan dikemas dalam bentuk dropdown untuk menghindari kesalahan format penulisan. Data ruangan/unit otomatis mendeteksi profil petugas yang login.
* **Validasi Handal**: Input divalidasi ketat secara client-side (seperti panjang password minimal 6 karakter, format No RM) dan server-side dengan visualisasi error yang informatif langsung pada input field yang bermasalah.
* **Pencegahan Timezone Shift**: Penyimpanan data waktu di database menggunakan baseline UTC dan di-render di frontend dengan konversi UTC yang aman untuk mencegah pergeseran jam kejadian akibat perbedaan zona waktu server/browser.

### 5. Audit Trail & Log Aktivitas
* Mencatat setiap pembuatan, pengubahan, dan penghapusan data indikator mutu demi menjaga transparansi, akuntabilitas, dan keamanan data.

---

## Arsitektur Teknologi

* **Frontend**: HTML5 Semantic, Vanilla CSS3 (Custom Variables), Vanilla Javascript (ES Modules / SPA Client-side Router).
* **Backend**: Node.js, Express, Prisma ORM.
* **Database**: MariaDB / MySQL.

---

## Persiapan & Instalasi

### 1. Prasyarat (Prerequisites)
Pastikan sistem Anda sudah terinstal:
* [Node.js](https://nodejs.org/) (versi 18 atau yang lebih baru)
* [Docker & Docker Compose](https://www.docker.com/) (opsional, jika ingin menjalankan MariaDB dengan Docker)
* **MariaDB Server** (jika ingin diinstal langsung di server lokal)

### 2. Jalankan Database MariaDB

#### Opsi A: Menggunakan Docker Compose (Bawaan)
Jika menggunakan konfigurasi docker-compose bawaan, jalankan perintah berikut di root folder:
```bash
docker-compose up -d
```

#### Opsi B: Menggunakan MariaDB-Server Lokal (Tanpa Docker)
Jika Anda menginstal MariaDB langsung pada sistem operasi server lokal:
1. Masuk ke terminal/console MariaDB:
   ```bash
   sudo mysql -u root -p
   ```
2. Buat database baru bernama `db_mutu_rsik`:
   ```sql
   CREATE DATABASE db_mutu_rsik;
   ```
3. Buat user dan berikan hak akses penuh. Jika ingin diakses secara remote/dari perangkat lain di jaringan lokal yang sama, gunakan host `%` atau IP spesifik klien Anda:
   ```sql
   -- Memberikan akses dari IP mana saja di jaringan lokal:
   GRANT ALL PRIVILEGES ON db_mutu_rsik.* TO 'simurs'@'%' IDENTIFIED BY 'password_anda';
   FLUSH PRIVILEGES;
   EXIT;
   ```

### 3. Konfigurasi Environment
Salin file konfigurasi environment di dalam folder `backend/`:
* **Linux/macOS:**
  ```bash
  cp backend/.env.example backend/.env
  ```
* **Windows (PowerShell):**
  ```powershell
  Copy-Item backend/.env.example backend/.env
  ```

Sesuaikan nilai `DATABASE_URL` di file `backend/.env` sesuai konfigurasi MariaDB Anda:
```env
DATABASE_URL="mysql://simurs:password_anda@localhost:3306/db_mutu_rsik"
JWT_SECRET="ganti_dengan_jwt_secret_aman"
JWT_REFRESH_SECRET="ganti_dengan_jwt_refresh_secret_aman"
PORT=3000
```

> [!WARNING]
> **Troubleshooting Karakter Khusus di Password Database (Error P1013/P1012):**
> Jika password database Anda menggunakan karakter khusus seperti `#`, `@`, `:`, `/`, atau `?`, Anda **wajib** mengubahnya ke bentuk *URL-encoded* di dalam file `.env`:
> - `#` menjadi `%23`
> - `@` menjadi `%40`
> - `:` menjadi `%3A`
> - `/` menjadi `%2F`
>
> *Contoh:* jika password Anda `sudosu99#`, tulis di `.env` sebagai `mysql://user:sudosu99%23@localhost:3306/db_mutu_rsik`.

---

## Cara Menjalankan Aplikasi

SIMURS menggunakan model *single server instance*. Backend Node.js menyajikan API sekaligus melayani file-file statis frontend SPA.

### 1. Instalasi Dependensi Backend
```bash
cd backend
npm install
```

### 2. Sinkronisasi Skema Database Prisma
Sinkronkan model database ke MariaDB Anda:
```bash
npx prisma db push --schema=src/prisma/schema.prisma
```

### 3. Seed Data Awal (Opsional tetapi Direkomendasikan)
Gunakan seeder bawaan untuk mengisi data unit kerja, periode uji coba, dan akun demo:
```bash
npm run prisma:seed
```

### 4. Jalankan Aplikasi
Jalankan server dalam mode development:
```bash
npm run dev
```
Aplikasi kini berjalan dan dapat diakses di browser Anda:
👉 **[http://localhost:3000](http://localhost:3000)**

#### Tips Menjalankan di Windows (Server Lokal)
1. **Gunakan Script `.bat` Otomatis**:
   Anda bisa membuat file bernama `start_server.bat` di Windows dengan isi berikut untuk menjalankan server cukup dengan klik dua kali:
   ```bat
   @echo off
   title SIMURS Server
   color 0B
   cls
   echo Memulai Server SIMURS...
   cd /d C:\path\ke\proyek\SIMURS\backend
   npm run start
   pause
   ```
2. **Akses dari Perangkat Lain di Jaringan yang Sama**:
   Jika ingin mengakses server dari HP/Komputer lain menggunakan IP local server (misal `http://192.168.1.2:3000/`):
   * **Windows Defender Firewall**: Buka *Windows Defender Firewall with Advanced Security* -> Klik *Inbound Rules* -> Klik *New Rule...* -> Pilih *Port* (TCP) -> Isi port `3000` (atau port yang Anda gunakan) -> Pilih *Allow the connection* -> Simpan dengan nama `SIMURS Port`.
   * **Profil Jaringan**: Pastikan tipe profil jaringan internet Wi-Fi/Ethernet di Windows Anda disetel ke **Private**, bukan *Public*.

---

## Akun Demo (Bawaan Seeder)

| Username | Password | Role | Deskripsi Hak Akses |
| :--- | :--- | :--- | :--- |
| `admin` | `admin123` | **Admin** | Akses penuh, kelola user (tambah, edit, hapus), kelola periode |
| `komite` | `komite123` | **Komite Mutu** | Monitoring dashboard, filter indikator, dan ekspor/cetak laporan |
| `pic_ranap` | `pic123` | **PIC Mutu** | Akses modul rawat inap terikat (Jabal Nur) |
| `petugas_igd` | `petugas123` | **Petugas** | Akses modul IGD terikat (Unit Gawat Darurat) |

---

## Panduan Penggunaan Sistem

### 1. Login Ke Aplikasi
1. Buka halaman utama [http://localhost:3000](http://localhost:3000).
2. Masukkan `Username` dan `Password` sesuai role Anda.
3. Klik tombol **Login**.

### 2. Pengisian Data Indikator (Petugas / PIC Mutu)
1. Pilih modul indikator pada sidebar sebelah kiri (misal: **Risiko Jatuh**).
2. Klik tombol **+ Tambah Data**.
3. Isi data form pasien (Tanggal, Nama Pasien, No RM, Usia, dsb.).
4. Untuk input **Ruangan / Unit Kerja**, sistem akan secara otomatis mendeteksi dan mengunci ruangan sesuai profil penugasan Anda.
5. Pilih **Bulan** melalui dropdown (combo box) yang tersedia.
6. Klik **Simpan**.

### 3. Pengelolaan Pengguna (Khusus Admin)
1. Navigasi ke menu **Kelola Pengguna** di sidebar.
2. **Tambah Pengguna**: Klik **+ Tambah Pengguna**, isi formulir, tentukan role, lalu pilih unit kerja. Centang modul-modul indikator yang boleh diakses pengguna tersebut jika role-nya `petugas` atau `pic_mutu`. Klik **Simpan**.
3. **Edit Pengguna**: Klik tombol **Edit** pada tabel pengguna untuk memperbarui data, hak akses modul, atau mengganti password (kosongkan jika tidak ingin diubah).
4. **Hapus Pengguna**: Klik tombol **Hapus** pada pengguna yang ingin dibuang. Sistem akan meminta konfirmasi. *Catatan: Anda tidak dapat menghapus akun Anda sendiri yang sedang digunakan.*

### 4. Pengelolaan Periode & Penguncian Data (Khusus Admin)
1. Navigasi ke menu **Kelola Periode**.
2. **Tambah Periode**: Klik **+ Tambah Periode**, masukkan bulan dan tahun, lalu simpan.
3. **Tutup Periode**: Klik **Close Periode** pada periode berjalan (misal: Juni 2026). Setelah periode ditutup (status `closed`), seluruh data indikator pada periode tersebut **tidak dapat ditambah, diubah, maupun dihapus** oleh siapa pun (termasuk admin) demi integritas pelaporan mutu.

### 5. Monitoring & Cetak Laporan (Komite Mutu / Admin)
1. Masuk ke halaman **Dashboard** untuk memantau visualisasi grafik pencapaian mutu pelayanan.
2. Navigasi ke menu **Cetak Laporan** di sidebar.
3. Pilih unit kerja dan periode bulan/tahun yang ingin dilaporkan.
4. Klik **Filter** untuk menyajikan data rekapitulasi.
5. Klik **Cetak PDF / Print** untuk mengekspor dokumen laporan secara rapi dan profesional.

---

## Pemecahan Masalah (Troubleshooting)

* **Error `PrismaClientValidationError` saat simpan data:**
  Terjadi karena ketidaksesuaian tipe enum di database. Pastikan input yang dimasukkan dari frontend (seperti `"tidak_dilakukan"`, `"tidak_sesuai"`) sudah dinormalisasi dengan underscore sebelum dikirim ke database Prisma.
* **Pergeseran Waktu (Timezone Shift) pada Jam Kejadian:**
  SIMURS menyimpan objek waktu dalam format ISO String (UTC). Pastikan untuk selalu membaca jam dan menit menggunakan method `getUTCHours()` dan `getUTCMinutes()` di bagian rendering frontend guna menghindari manipulasi zona waktu lokal browser.
* **Error `SyntaxError: Unexpected token 'export'`:**
  Periksa kembali file Javascript frontend. Pastikan tidak ada tanda kurung kurawal (`}`) yang hilang pada fungsi-fungsi penolong sebelum statement `export const render`.

---

## Panduan Pengembang (Developer Guide)

Untuk menambahkan modul indikator mutu ke-35 dan seterusnya:
1. **Definisikan Model di Database**: Buka [schema.prisma](backend/src/prisma/schema.prisma), tambahkan skema tabel indikator baru lengkap dengan relasi ke `Periode`, `Unit`, dan `User`.
2. **Push Skema & Generate Client**: Jalankan `npx prisma db push`.
3. **Buat File Tampilan Frontend**: Buat berkas baru di `frontend/js/pages/modules/[nama-indikator].js`. Anda bisa menyalin dan mengadaptasi implementasi dari [risiko-jatuh.js](frontend/js/pages/modules/risiko-jatuh.js) atau [generic-indicator.js](frontend/js/pages/modules/generic-indicator.js).
4. **Daftarkan Rute & Navigasi**:
   * Buka [modules.js](frontend/js/config/modules.js), masukkan item menu baru beserta alamat hash-nya.
   * Buka [router.js](frontend/js/router.js), daftarkan hash tersebut agar dimuat oleh Single Page Application (SPA) Router.
