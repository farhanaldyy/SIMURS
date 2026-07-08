# Product Requirements Document (PRD)
## Sistem Informasi Mutu Rumah Sakit (SIMURS)
### Versi Vanilla JS

**Versi:** 1.1.0  
**Tanggal:** Juli 2026  
**Status:** Updated  

---

## 1. Overview

### 1.1 Latar Belakang

Pencatatan data indikator mutu rumah sakit saat ini dilakukan secara manual menggunakan file Excel (.xlsx) dengan 34 sheet berbeda, mencakup indikator keselamatan pasien, klinis, IGD, HD, operasi, dan gizi. Proses ini rentan kesalahan input, tidak memiliki validasi otomatis, sulit diakses banyak pengguna secara bersamaan, dan menyulitkan pelaporan agregat bulanan.

### 1.2 Tujuan Produk

Membangun aplikasi web berbasis Vanilla JS (tanpa framework frontend) untuk input, penyimpanan, dan pelaporan data mutu rumah sakit yang:
- Menggantikan pencatatan manual di Excel
- Menyediakan validasi data secara real-time
- Menghitung nilai kepatuhan/indikator secara otomatis
- Menghasilkan laporan bulanan yang dapat diekspor ke Excel/PDF
- Dapat diakses multi-user sesuai peran masing-masing
- Ringan, cepat, dan tidak memerlukan proses build/compile di sisi frontend
### 1.3 Stakeholder & Pengguna

| Peran | Level Akses | Hak Akses / Fungsionalitas Utama |
|---|---|---|
| **Admin** | Administrator | Hak akses penuh: CRUD semua data indikator, manajemen pengguna (tambah, edit, hapus), pengelolaan periode pengisian (buka & tutup periode), serta menelusuri log audit (Audit Trail). |
| **Komite Mutu** | Evaluator / Auditor | Monitoring dashboard kinerja interaktif, penyaringan pencapaian indikator, pengawasan audit trail, serta ekspor dan pencetakan laporan bulanan/tahunan. |
| **PIC Mutu** | Operator Terbatas | Mengisi dan mereview data indikator mutu di ruangan/unit kerja yang ditugaskan. Hak akses modul dibatasi secara granular oleh Admin melalui checklist. |
| **Petugas** | Operator Terbatas | Mengisi data indikator mutu di ruangan/unit kerja yang ditugaskan. Hak akses modul dibatasi secara granular oleh Admin melalui checklist. |

---

## 2. Tech Stack

### 2.1 Frontend (Vanilla JS — tanpa framework)

| Kategori | Pilihan | Keterangan |
|---|---|---|
| **Bahasa** | HTML5 + CSS3 + JavaScript (ES6+) | Tidak ada transpiler, langsung dijalankan browser |
| **Styling** | CSS Custom Properties + Flexbox/Grid | Tidak pakai Tailwind; tulis CSS manual dengan design system konsisten |
| **Routing** | Hash-based SPA router (custom, ~50 baris) | `#/dashboard`, `#/risiko-jatuh`, dll — tanpa library |
| **HTTP Client** | Native `fetch()` API | Tidak perlu Axios |
| **State Management** | Module-level JS objects (custom store) | Tidak perlu Zustand/Redux |
| **Chart** | Chart.js (CDN) | Satu-satunya library eksternal yang diizinkan di frontend |
| **Tabel** | Render HTML `<table>` via DOM manipulation | Custom sort & pagination tanpa library |
| **Export Excel** | SheetJS (xlsx.full.min.js via CDN) | Untuk export ke .xlsx |
| **Export PDF** | jsPDF (via CDN) | Untuk export ringkasan PDF |
| **Validasi Form** | Custom validation helper (`/js/utils/validator.js`) | Fungsi reusable tanpa library |
| **Date/Time** | Native `Date` API + custom formatter | Tanpa library seperti dayjs/moment |
| **Notifikasi** | Custom toast component (`/js/components/toast.js`) | Tanpa library |
| **Modal** | Custom modal component (`/js/components/modal.js`) | Tanpa library |

### 2.2 Backend

| Kategori | Pilihan |
|---|---|
| **Runtime** | Node.js 20 LTS |
| **Framework** | Express.js |
| **ORM** | Prisma |
| **Autentikasi** | JWT (jsonwebtoken) — access token 8 jam + refresh token 7 hari |
| **Validasi** | express-validator |
| **Password** | bcryptjs |
| **Upload File** | Multer (untuk import Excel) |
| **Parsing Excel** | SheetJS (xlsx) di sisi server |
| **Logger** | Morgan + Winston |

### 2.3 Database

| Kategori | Pilihan |
|---|---|
| **Utama** | MySQL 8.0 |
| **Koneksi** | Prisma Client |
| **Cache** | Tidak digunakan di v1.0 |

### 2.4 Infrastructure

| Kategori | Pilihan |
|---|---|
| **Deployment** | Docker + Docker Compose |
| **Web Server** | Nginx (serve file statis frontend + reverse proxy ke API) |
| **Environment** | `.env` file per environment |
| **SSL** | Nginx + Let's Encrypt (production) |

---

## 3. Struktur Direktori Proyek

```
simurs/
│
├── frontend/                        # Pure Vanilla JS App (file statis)
│   ├── index.html                   # Entry point tunggal (SPA)
│   ├── assets/
│   │   ├── css/
│   │   │   ├── main.css             # Reset + variabel CSS global
│   │   │   ├── layout.css           # Sidebar, header, konten
│   │   │   ├── components.css       # Tombol, form, tabel, modal, badge
│   │   │   └── pages/
│   │   │       ├── dashboard.css
│   │   │       └── modul.css        # Style umum halaman modul
│   │   └── img/
│   │       └── logo.png
│   │
│   └── js/
│       ├── app.js                   # Entry point: init router, auth check
│       ├── router.js                # Hash-based SPA router
│       ├── store.js                 # Global state (user, periode, unit aktif)
│       │
│       ├── api/
│       │   ├── client.js            # fetch() wrapper: base URL, auth header, error handling
│       │   ├── auth.js              # login, logout, refreshToken, getMe
│       │   ├── master.js            # getUnits, getPeriode, getUsers, dll
│       │   ├── dashboard.js         # getSummary
│       │   └── modules/
│       │       ├── risiko-jatuh.js
│       │       └── ... (34 file, satu per modul)
│       │
│       ├── components/
│       │   ├── sidebar.js           # Render sidebar + navigasi aktif
│       │   ├── header.js            # Render header (user info, periode, unit)
│       │   ├── modal.js             # showModal(title, contentHTML, onConfirm)
│       │   ├── toast.js             # showToast(message, type: success|error|warning)
│       │   ├── table.js             # renderTable(containerId, columns, data, options)
│       │   ├── pagination.js        # renderPagination(containerId, total, page, limit)
│       │   └── indicator-badge.js   # renderBadge(nilai, threshold, tipe)
│       │
│       ├── pages/
│       │   ├── login.js             # Halaman login
│       │   ├── dashboard.js         # Halaman dashboard
│       │   ├── admin/
│       │   │   ├── users.js
│       │   │   ├── units.js
│       │   │   ├── periode.js
│       │   │   └── audit-log.js
│       │   └── modules/
│       │       ├── risiko-jatuh.js  # Halaman list + form modul ini
│       │       └── ... (35 file, termasuk generic-indicator.js)
│       │
│       └── utils/
│           ├── validator.js         # validateRequired, validateTime, validateNoRM, dll
│           ├── formatter.js         # formatDate, formatTime, formatPercent, hitungSelisihMenit
│           ├── calculator.js        # hitungNilaiN, hitungNumerator, hitungIndikator
│           └── export.js            # exportToExcel(data), exportToPDF(data)
│
├── backend/
│   ├── src/
│   │   ├── index.js                 # Entry point Express
│   │   ├── config/
│   │   │   └── database.js          # Prisma client instance
│   │   ├── middleware/
│   │   │   ├── auth.js              # verifyToken middleware
│   │   │   ├── authorize.js         # checkRole(roles[]) middleware
│   │   │   ├── validate.js          # express-validator error handler
│   │   │   └── errorHandler.js      # Global error handler
│   │   ├── routes/
│   │   │   ├── index.js             # Mount semua route
│   │   │   ├── auth.js
│   │   │   ├── master.js
│   │   │   ├── dashboard.js
│   │   │   ├── laporan.js
│   │   │   └── modules/
│   │   │       ├── risiko-jatuh.js
│   │   │       └── ... (35 file, termasuk master-tindakan.js)
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── master.controller.js
│   │   │   ├── dashboard.controller.js
│   │   │   ├── laporan.controller.js
│   │   │   └── modules/
│   │   │       ├── risiko-jatuh.controller.js
│   │   │       └── ... (35 file, termasuk master-tindakan.controller.js)
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── laporan.service.js
│   │   │   └── modules/
│   │   │       ├── risiko-jatuh.service.js
│   │   │       └── ... (35 service, termasuk master-tindakan.service.js)
│   │   └── prisma/
│   │       └── schema.prisma
│   └── package.json
│
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

---

## 4. Pola Arsitektur Frontend (Vanilla JS)

### 4.1 SPA Router (Hash-based)

File `js/router.js` menangani navigasi tanpa reload halaman:

```javascript
// Contoh implementasi router.js
const routes = {
  '#/login':                      { module: () => import('./pages/login.js'), title: 'Login' },
  '#/dashboard':                  { module: () => import('./pages/dashboard.js'), title: 'Dashboard' },
  '#/risiko-jatuh':               { module: () => import('./pages/modules/risiko-jatuh.js'), title: 'Risiko Jatuh' },
  '#/insiden-keselamatan':        { module: () => import('./pages/modules/insiden-keselamatan.js'), title: 'Insiden Keselamatan Pasien' },
  // ... semua 34 modul
  '#/admin/users':                { module: () => import('./pages/admin/users.js'), title: 'Kelola Pengguna' },
  '#/admin/periode':              { module: () => import('./pages/admin/periode.js'), title: 'Kelola Periode' },
  '#/admin/units':                { module: () => import('./pages/admin/units.js'), title: 'Kelola Unit' },
  '#/admin/audit-log':            { module: () => import('./pages/admin/audit-log.js'), title: 'Audit Trail' },
  '#/master-tindakan':            { module: () => import('./pages/modules/master-tindakan.js'), title: 'Master Tindakan' },
};

// Setiap page module harus export fungsi: render() dan destroy()
```

### 4.2 Global Store

File `js/store.js` menyimpan state yang dibagikan antar halaman:

```javascript
// store.js — plain JS object, bukan reactive
const Store = {
  user: null,          // { id, nama, role, unit_id }
  periodeAktif: null,  // { id, bulan, tahun }
  unitAktif: null,     // { id, nama_unit }
  token: null,

  set(key, value) { this[key] = value; },
  get(key) { return this[key]; },
  clear() { this.user = null; this.token = null; /* ... */ }
};
```

### 4.3 API Client

File `js/api/client.js` membungkus `fetch()` dengan otomatis menambahkan header Authorization:

```javascript
// Semua pemanggilan API harus melalui client ini
async function apiCall(method, endpoint, body = null) {
  const res = await fetch(`/api${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Store.get('token')}`
    },
    body: body ? JSON.stringify(body) : null
  });
  if (res.status === 401) { /* redirect login */ }
  return res.json();
}
```

### 4.4 Struktur Halaman Modul

Setiap file `pages/modules/[nama-modul].js` wajib mengikuti pola ini:

```javascript
// pages/modules/risiko-jatuh.js
import { renderTable } from '../../components/table.js';
import { showModal } from '../../components/modal.js';
import { showToast } from '../../components/toast.js';
import * as api from '../../api/modules/risiko-jatuh.js';

// State lokal halaman ini
let state = { data: [], page: 1, limit: 10, total: 0, summary: {} };

export async function render(container) {
  container.innerHTML = getHTML();       // Render skeleton HTML
  await loadData();                      // Fetch data dari API
  bindEvents();                          // Pasang event listener
}

export function destroy() {
  // Cleanup event listeners jika perlu
}

function getHTML() {
  return `
    <div class="page-header">...</div>
    <div class="filter-bar">...</div>
    <div id="table-container"></div>
    <div id="summary-container"></div>
  `;
}

async function loadData() { /* fetch + renderTable */ }
function bindEvents() { /* tombol tambah, edit, hapus */ }
function openFormModal(data = null) { /* showModal dengan form */ }
async function handleSubmit(e) { /* validasi + api call + reload */ }
```

---

## 5. Database Schema

### 5.1 Tabel Master

```sql
-- Master Data
users (id, nama, username, password_hash, role ENUM('admin','pic_mutu','komite','petugas'), unit_id, allowed_modules TEXT, aktif BOOLEAN, created_at)
units (id, nama_unit, kode_unit, aktif BOOLEAN)
periode (id, bulan TINYINT, tahun SMALLINT, status ENUM('open','closed'), created_at)
audit_log (id, user_id, tabel, record_id, aksi ENUM('create','update','delete'), data_lama JSON, data_baru JSON, created_at)
```

### 5.2 Tabel Indikator (34 Sheet)

```sql
-- Sheet 1: Risiko Jatuh
risiko_jatuh (
  id, periode_id, unit_id,
  nama_pasien VARCHAR(100), usia TINYINT, no_rm VARCHAR(20),
  asesmen_awal ENUM('dilakukan','tidak dilakukan'),
  asesmen_ulang ENUM('dilakukan','tidak dilakukan'),
  intervensi ENUM('dilakukan','tidak dilakukan'),
  edukasi ENUM('dilakukan','tidak dilakukan'),
  nilai_n TINYINT GENERATED,   -- dihitung otomatis: 1 jika semua 'dilakukan'
  created_by INT, created_at DATETIME, updated_at DATETIME
)

-- Sheet 2: Insiden Keselamatan Pasien
insiden_keselamatan (
  id, periode_id, unit_id,
  tanggal_kejadian DATE, jam_kejadian TIME,
  nama_pasien VARCHAR(100), no_rm VARCHAR(20),
  deskripsi_insiden TEXT,
  jenis_insiden ENUM('KTD','KNC','KPC','Sentinel','KTC'),
  created_by INT, created_at DATETIME
)

-- Sheet 3: Reaksi Transfusi
reaksi_transfusi (
  id, periode_id, unit_id,
  nama_pasien VARCHAR(100), no_rm VARCHAR(20),
  ada_reaksi BOOLEAN DEFAULT FALSE,
  jumlah_permintaan_kolf TINYINT,
  darah_masuk_kolf TINYINT,
  keterangan VARCHAR(200),
  nilai_n TINYINT,   -- 1 jika tidak ada reaksi
  created_by INT, created_at DATETIME
)

-- Sheet 4 & 11: Angka Kematian (Ranap & IGD)
angka_kematian (
  id, periode_id, unit_id,
  lokasi ENUM('ranap','igd'),
  nama_pasien VARCHAR(100), no_rm VARCHAR(20),
  tanggal_masuk DATE, jam_masuk TIME,
  tanggal_keluar DATE, jam_keluar TIME,
  keterangan VARCHAR(200),
  created_by INT, created_at DATETIME
)

-- Sheet 5: Double Check High Alert
double_check_high_alert (
  id, periode_id, unit_id,
  nama_pasien VARCHAR(100), no_rm VARCHAR(20),
  diagnosis VARCHAR(255), nama_obat VARCHAR(100),
  nama_penyerah VARCHAR(100), nama_penerima VARCHAR(100),
  keterangan VARCHAR(200), nilai_n TINYINT DEFAULT 1,
  created_by INT, created_at DATETIME
)

-- Sheet 6: Waktu Tanggap SC Emergency
waktu_tanggap_sc (
  id, periode_id, unit_id,
  nama_pasien VARCHAR(100), no_rm VARCHAR(20), diagnosis VARCHAR(255),
  jam_ditentukan_operasi TIME,
  jam_sayatan_pertama TIME,
  selisih_menit SMALLINT,   -- dihitung otomatis di service
  nilai_n TINYINT,          -- 1 jika selisih_menit <= 30
  created_by INT, created_at DATETIME
)

-- Sheet 7: Identifikasi Pasien
identifikasi_pasien (
  id, periode_id, unit_id,
  tanggal DATE, nama_pasien VARCHAR(100), no_rm VARCHAR(20),
  pemberian_obat ENUM('dilakukan','tidak dilakukan','tidak ada peluang'),
  nutrisi_ngt ENUM('dilakukan','tidak dilakukan','tidak ada peluang'),
  pemberian_darah ENUM('dilakukan','tidak dilakukan','tidak ada peluang'),
  tindakan_keperawatan ENUM('dilakukan','tidak dilakukan','tidak ada peluang'),
  created_by INT, created_at DATETIME
)

-- Sheet 8: Alur Klinis
alur_klinis (
  id, periode_id, unit_id,
  nama_pasien VARCHAR(100), no_rm VARCHAR(20),
  diagnosis VARCHAR(255), ruangan VARCHAR(50), bulan VARCHAR(20),
  los ENUM('sesuai','tidak sesuai'),
  penunjang ENUM('sesuai','tidak sesuai'),
  obat ENUM('sesuai','tidak sesuai'),
  nilai_n TINYINT,   -- 1 jika semua 'sesuai'
  created_by INT, created_at DATETIME
)

-- Sheet 9: Visit Dokter Spesialis
visit_dokter (
  id, periode_id, unit_id,
  nama_dpjp VARCHAR(100), nama_pasien VARCHAR(100), no_rm VARCHAR(20),
  jam_mulai_selesai VARCHAR(20),
  jam_visit TIME,
  kategori_visit ENUM('tepat_waktu','terlambat','sangat_terlambat'),
  n1 TINYINT, n2 TINYINT,
  created_by INT, created_at DATETIME
)

-- Sheet 10: Emergency Response Time
emergency_response_time (
  id, periode_id, unit_id,
  nama_pasien VARCHAR(100), no_rm VARCHAR(20),
  jam_datang TIME, jam_dilayani_dokter TIME,
  respon_time_menit DECIMAL(5,2),   -- dihitung otomatis di service
  triase ENUM('Merah','Kuning','Hijau','Hitam'),
  created_by INT, created_at DATETIME
)

-- Sheet 12: Asesmen Awal IGD
asesmen_awal_igd (
  id, periode_id, unit_id,
  nama_pasien VARCHAR(100), no_rm VARCHAR(20),
  anamnesis ENUM('ada','tidak ada'), ttv ENUM('ada','tidak ada'),
  tb ENUM('ada','tidak ada'), bb ENUM('ada','tidak ada'),
  diagnosis ENUM('ada','tidak ada'), terapi ENUM('ada','tidak ada'),
  nilai_n TINYINT,   -- 1 jika semua 'ada'
  created_by INT, created_at DATETIME
)

-- Sheet 13: Pasien Tertahan IGD
pasien_tertahan_igd (
  id, periode_id, unit_id,
  nama_pasien VARCHAR(100), no_rm VARCHAR(20),
  jam_masuk TIME, jam_pindah_ruangan TIME,
  waktu_tunggu_menit INT,   -- dihitung otomatis di service
  keterangan VARCHAR(200),
  created_by INT, created_at DATETIME
)

-- Sheet 14: Pemasangan Gelang Identitas
gelang_identitas (
  id, periode_id, unit_id,
  nama_pasien VARCHAR(100), no_rm VARCHAR(20),
  gelang_identitas ENUM('dilakukan','tidak dilakukan'),
  alergi ENUM('dilakukan','tidak dilakukan'),
  fall_risk ENUM('dilakukan','tidak dilakukan'),
  dnr ENUM('dilakukan','tidak dilakukan'),
  keterangan VARCHAR(200),
  created_by INT, created_at DATETIME
)

-- Sheet 15: Serah Terima Pasien
serah_terima_pasien (
  id, periode_id, unit_id,
  nama_pasien VARCHAR(100),
  akun ENUM('Sesuai','Tidak Sesuai'),
  keluhan ENUM('Sesuai','Tidak Sesuai'),
  ttv ENUM('Sesuai','Tidak Sesuai'),
  penunjang ENUM('Sesuai','Tidak Sesuai'),
  konsul ENUM('Sesuai','Tidak Sesuai'),
  tindakan ENUM('Sesuai','Tidak Sesuai'),
  obat ENUM('Sesuai','Tidak Sesuai'),
  keterangan VARCHAR(200), nilai_n TINYINT,
  created_by INT, created_at DATETIME
)

-- Sheet 16: Kembali ke ICU < 72 Jam
kembali_icu (
  id, periode_id,
  nama_pasien VARCHAR(100), no_rm VARCHAR(20),
  diagnosis VARCHAR(255), dpjp VARCHAR(100), keterangan TEXT,
  created_by INT, created_at DATETIME
)

-- Sheet 17: Ketidakpatuhan Pasien HD
ketidakpatuhan_hd (
  id, periode_id,
  nama_pasien VARCHAR(100), no_rm VARCHAR(20),
  jadwal_hd_per_minggu VARCHAR(50),
  hari_tidak_datang VARCHAR(30),
  alasan TEXT,
  created_by INT, created_at DATETIME
)

periode_hd_summary (
  id, periode_id,
  total_pasien_hd INT DEFAULT 0,
  total_avgraft_avf INT DEFAULT 0,
  updated_at DATETIME
)

-- Sheet 18: Insiden Clotting Durante
insiden_clotting (
  id, periode_id,
  tanggal_kejadian DATE, nama_pasien VARCHAR(100), no_rm VARCHAR(20),
  deskripsi_insiden TEXT, pemberian_antiplatelet TEXT,
  created_by INT, created_at DATETIME
)

-- Sheet 19: Insiden Jarum Vena Fistula
insiden_jarum_vena (
  id, periode_id,
  tanggal_kejadian DATE, nama_pasien VARCHAR(100), no_rm VARCHAR(20),
  perawat_pemasang VARCHAR(100), penyebab TEXT,
  created_by INT, created_at DATETIME
)

periode_jarum_vena_summary (
  id, periode_id,
  total_pemasangan_bulan INT DEFAULT 0,
  updated_at DATETIME
)

-- Sheet 20: Penundaan Operasi Elektif
penundaan_operasi (
  id, periode_id,
  tanggal DATE, nama_pasien VARCHAR(100), no_rm VARCHAR(20), dpjp VARCHAR(100),
  jadwal_jam_operasi TIME, jam_mulai_operasi TIME,
  waktu_tunggu_menit INT,   -- dihitung otomatis
  batal BOOLEAN DEFAULT FALSE,
  indikasi_medis BOOLEAN DEFAULT FALSE,
  created_by INT, created_at DATETIME, updated_at DATETIME
)

periode_penundaan_summary (
  id, periode_id,
  standar_menit INT DEFAULT 60,
  updated_at DATETIME
)

-- Sheet 21 & 26: Informed Consent (Pembedahan & Anestesi)
informed_consent (
  id, periode_id, unit_id,
  jenis ENUM('pembedahan','anestesi'),
  tanggal DATE, nama_pasien VARCHAR(100), no_rm VARCHAR(20), dpjp VARCHAR(100),
  diisi BOOLEAN, keterangan VARCHAR(200),
  created_by INT, created_at DATETIME
)

-- Sheet 22 & 27: Asesmen Pra Bedah & Pra Anestesi
asesmen_pra_operasi (
  id, periode_id, unit_id,
  jenis ENUM('pra_bedah','pra_anestesi'),
  tanggal DATE, nama_pasien VARCHAR(100), no_rm VARCHAR(20), dpjp VARCHAR(100),
  diisi BOOLEAN, keterangan VARCHAR(200),
  created_by INT, created_at DATETIME
)

-- Sheet 23 & 24: Surgical Checklist (SC & Operasi Umum)
surgical_checklist (
  id, periode_id, unit_id,
  jenis ENUM('sc','operasi_umum'),
  tanggal DATE, nama_pasien VARCHAR(100), no_rm VARCHAR(20), dpjp VARCHAR(100),
  sign_in BOOLEAN, time_out BOOLEAN, sign_out BOOLEAN,
  keterangan VARCHAR(200),
  created_by INT, created_at DATETIME
)

-- Sheet 25: Penandaan Lokasi Operasi
penandaan_lokasi_operasi (
  id, periode_id,
  tanggal DATE, nama_pasien VARCHAR(100), no_rm VARCHAR(20),
  diagnosis VARCHAR(255), dpjp VARCHAR(100),
  dilakukan BOOLEAN, not_applicable BOOLEAN,
  keterangan VARCHAR(200),
  created_by INT, created_at DATETIME
)

-- Standar Kamar Operasi Mutu
mutu_kamar_operasi (
  id, periode_id,
  tipe VARCHAR(50), -- 'kematian_meja_operasi', 'salah_sisi', 'salah_orang', 'salah_prosedur'
  total_kejadian INT DEFAULT 0,
  total_operasi INT DEFAULT 0,
  created_by INT, created_at DATETIME, updated_at DATETIME
)

-- Gizi: Ketepatan Waktu Pemberian Makanan
gizi_waktu_makanan (
  id, periode_id, unit_id,
  tanggal DATE,
  jumlah_tepat_waktu INT,
  jumlah_porsi INT,
  persentase INT,
  created_by INT, created_at DATETIME, updated_at DATETIME
)

-- Gizi: Sisa Makanan Yang Tidak Termakan
gizi_sisa_makanan (
  id, periode_id, unit_id,
  tanggal DATE,
  jumlah_sisa INT,
  jumlah_porsi INT,
  persentase INT,
  created_by INT, created_at DATETIME, updated_at DATETIME
)

-- Gizi: Tidak Adanya Kesalahan Pemberian Diet
gizi_kesalahan_diet (
  id, periode_id, unit_id,
  tanggal DATE,
  jumlah_tidak_salah INT,
  jumlah_porsi INT,
  persentase INT,
  created_by INT, created_at DATETIME, updated_at DATETIME
)

-- Gizi: Kepatuhan Identifikasi Pasien
gizi_identifikasi_pasien (
  id, periode_id, unit_id,
  tanggal DATE,
  jumlah_sesuai INT,
  jumlah_pasien_ranap INT,
  persentase INT,
  created_by INT, created_at DATETIME, updated_at DATETIME
)

-- Kepatuhan Kebersihan Tangan
kepatuhan_kebersihan_tangan (
  id, periode_id, unit_id,
  tanggal DATE,
  profesi ENUM('dokter', 'perawat', 'bidan', 'nakes_lain'),
  momen_1 BOOLEAN DEFAULT FALSE,
  momen_2 BOOLEAN DEFAULT FALSE,
  momen_3 BOOLEAN DEFAULT FALSE,
  momen_4 BOOLEAN DEFAULT FALSE,
  momen_5 BOOLEAN DEFAULT FALSE,
  tindakan ENUM('hr', 'hw', 'hr_hw', 'missed'),
  gloves BOOLEAN DEFAULT FALSE,
  tindakan_id INT, -- FK ke master_tindakan
  created_by INT, created_at DATETIME, updated_at DATETIME
)

-- Master Tindakan (untuk link ke Hand Hygiene)
master_tindakan (
  id, nama VARCHAR(100), nilai DOUBLE DEFAULT 0,
  created_at DATETIME, updated_at DATETIME
)

-- Kepatuhan Penggunaan APD
kepatuhan_apd (
  id, periode_id, unit_id,
  tanggal DATE, nama_pasien VARCHAR(100),
  tindakan VARCHAR(255), profesi VARCHAR(100),
  penutup_kepala BOOLEAN DEFAULT FALSE,
  face_shield BOOLEAN DEFAULT FALSE,
  masker BOOLEAN DEFAULT FALSE,
  apron BOOLEAN DEFAULT FALSE,
  coverall BOOLEAN DEFAULT FALSE,
  sarung_tangan BOOLEAN DEFAULT FALSE,
  cover_shoes BOOLEAN DEFAULT FALSE,
  created_by INT, created_at DATETIME, updated_at DATETIME
)
```

### 5.3 Sinkronisasi Enum Prisma dan Database
* **Pemetaan Karakter Khusus / Spasi:** Beberapa modul mendefinisikan status atau opsi yang mengandung spasi (misalnya `"tidak dilakukan"` atau `"tidak ada peluang"`). Karena Prisma Client memetakan enum string ini menggunakan atribut `@map("tidak dilakukan")` di schema.prisma, developer wajib mengirimkan versi key ber-underscore (seperti `"tidak_dilakukan"`, `"tidak_ada_peluang"`) dari backend service saat melakukan insert/update menggunakan Prisma Client.
* **Proses Normalisasi Data:** Rute API backend harus fleksibel menerima input ber-spasi maupun ber-underscore dari frontend, lalu melakukan normalisasi data ke bentuk key ber-underscore sebelum dikirimkan ke Prisma Client. Tampilan frontend juga harus secara dinamis menyesuaikan nilai option terpilih ketika memuat data yang dikembalikan oleh database (yang bertipe spasi).

### 5.4 Waktu dan Pencegahan Pergeseran Timezone
* **Penyimpanan Baseline UTC:** Kolom bertipe `DateTime` (Prisma) atau `TIME` (MySQL) disimpan menggunakan format ISO String ber-baseline UTC (`1970-01-01T[time]Z` untuk waktu mandiri).
* **Ekstraksi Waktu di Frontend:** Untuk menghindari pergeseran jam kejadian akibat perbedaan zona waktu (timezone offset) antara browser pengguna dan database server, frontend dilarang keras mengubah objek waktu ke representasi lokal menggunakan `.toLocaleTimeString()`. Pemrosesan komponen jam dan menit wajib menggunakan metode `.getUTCHours()` dan `.getUTCMinutes()` yang dibungkus oleh formatter global `formatTime` di `frontend/js/utils/formatter.js`.

---

## 6. API Endpoints

### 6.1 Auth
```
POST   /api/auth/login
POST   /api/auth/refresh-token
POST   /api/auth/logout
GET    /api/auth/me
```

### 6.2 Master Data
```
GET    /api/units
GET    /api/periode
POST   /api/periode                    (Admin)
PATCH  /api/periode/:id/close          (Admin)
GET    /api/users                      (Admin)
POST   /api/users                      (Admin)
PUT    /api/users/:id                  (Admin)
```

### 6.3 Indikator (pola seragam untuk semua 34 modul)
```
GET    /api/:modul?periode_id=&unit_id=&page=&limit=
POST   /api/:modul
PUT    /api/:modul/:id
DELETE /api/:modul/:id
GET    /api/:modul/summary?periode_id=&unit_id=
```

Nama `:modul`: `risiko-jatuh`, `insiden-keselamatan`, `reaksi-transfusi`, `angka-kematian-ranap`, `double-check-high-alert`, `waktu-tanggap-sc`, `identifikasi-pasien`, `alur-klinis`, `visit-dokter`, `emergency-response-time`, `asesmen-awal-igd`, `pasien-tertahan-igd`, `gelang-identitas`, `serah-terima-pasien`, `kembali-icu`, `ketidakpatuhan-hd`, `insiden-clotting`, `insiden-jarum-vena`, `penundaan-operasi`, `informed-consent-pembedahan`, `asesmen-pra-bedah`, `surgical-checklist-sc`, `surgical-checklist-operasi`, `penandaan-lokasi-operasi`, `informed-consent-anestesi`, `asesmen-pra-anestesi`, `angka-kematian-igd`, `mutu-kamar-operasi`, `gizi-waktu-makanan`, `gizi-sisa-makanan`, `gizi-kesalahan-diet`, `gizi-identifikasi-pasien`, `kepatuhan-kebersihan-tangan`, `kepatuhan-apd`

### 6.4 Dashboard & Laporan
```
GET    /api/dashboard/summary?periode_id=&unit_id=
GET    /api/laporan/export/excel?periode_id=&unit_id=
GET    /api/laporan/export/pdf?periode_id=&unit_id=
POST   /api/laporan/import-excel
GET    /api/audit-log?tabel=&periode_id=          (Admin)
```

### 6.5 Format Response API (wajib konsisten)

```json
// Success
{
  "success": true,
  "data": { ... } | [ ... ],
  "meta": { "total": 100, "page": 1, "limit": 10 }
}

// Error
{
  "success": false,
  "message": "Pesan error yang jelas",
  "errors": [ { "field": "nama_pasien", "message": "Wajib diisi" } ]
}
```

---

## 7. Fitur Aplikasi

### 7.1 Autentikasi & Otorisasi

Token JWT disimpan di `localStorage`. Setiap request API otomatis menyertakan header `Authorization: Bearer <token>`.

| Fitur | Petugas Input | PIC Mutu | Komite Mutu | Admin |
|---|---|---|---|---|
| Input data | ✅ (unit sendiri) | ✅ | ❌ | ✅ |
| Edit data | ✅ (hari yang sama) | ✅ | ❌ | ✅ |
| Hapus data | ❌ | ✅ | ❌ | ✅ |
| Lihat dashboard | ✅ (unit sendiri) | ✅ | ✅ (semua) | ✅ |
| Export laporan | ❌ | ✅ | ✅ | ✅ |
| Kelola user & periode | ❌ | ❌ | ❌ | ✅ |
| Tutup periode | ❌ | ❌ | ❌ | ✅ |

### 7.2 Daftar Modul Indikator (34 Sheet)

| No | Nama Modul | Rumus Nilai | Standar |
|---|---|---|---|
| 1 | Risiko Jatuh | N/total × 100% | 100% |
| 2 | Insiden Keselamatan Pasien | Jumlah insiden | 0% |
| 3 | Reaksi Transfusi | Jumlah reaksi / total transfusi × 100% | < 0,01% |
| 4 | Angka Kematian Ranap | Jumlah kematian / total pasien × 100% | % |
| 5 | Double Check High Alert | N/total × 100% | >= 80% |
| 6 | Waktu Tanggap SC Emergency | % selisih ≤ 30 menit | ≥ 80% |
| 7 | Identifikasi Pasien | Numerator / Denominator × 100% | 100% |
| 8 | Alur Klinis | N/total × 100% | 100% |
| 9 | Visit Dokter Spesialis | % tepat waktu (N1), % terlambat (N2) | ≥ 80% |
| 10 | Emergency Response Time | Rata-rata menit respon | ≤ 5 menit |
| 11 | Angka Kematian IGD | Jumlah kematian < 8 jam | 0% |
| 12 | Asesmen Awal IGD | N/total × 100% | 100% |
| 13 | Pasien Tertahan IGD | Rata-rata waktu tunggu (menit) | ≤ 240 menit |
| 14 | Pemasangan Gelang Identitas | Numerator / Denominator × 100% | 100% |
| 15 | Serah Terima Pasien | N/total × 100% | 100% |
| 16 | Kembali ke ICU < 72 Jam | Jumlah kejadian | - |
| 17 | Ketidakpatuhan Pasien HD | Jumlah tidak hadir / (total_pasien × 2 × minggu) × 100% | - |
| 18 | Insiden Clotting Durante | Jumlah insiden | - |
| 19 | Insiden Jarum Vena Fistula | Jumlah insiden / total pemasangan × 100% | 0% |
| 20 | Penundaan Operasi Elektif | (Total - Batal - Terlambat Tanpa Medis) / Total × 100% (dengan threshold periodik) | ≥ 95% |
| 21 | Informed Consent Pembedahan | Diisi / total × 100% | 100% |
| 22 | Asesmen Pra Bedah | Diisi / total × 100% | 100% |
| 23 | Surgical Checklist SC | Lengkap (3/3) / total × 100% | 100% |
| 24 | Surgical Checklist Operasi | Lengkap (3/3) / total × 100% | 100% |
| 25 | Penandaan Lokasi Operasi | Dilakukan / (total - N/A) × 100% | 100% |
| 26 | Informed Consent Anestesi | Diisi / total × 100% | 100% |
| 27 | Asesmen Pra Anestesi | Diisi / total × 100% | 100% |
| 28 | Kepatuhan Kebersihan Tangan | (HR + HW + HR/HW) / total observations × 100% | ≥ 85% |
| 29 | Kepatuhan Penggunaan APD | Total PPE digunakan / Total PPE check opportunities × 100% | 100% |
| 30 | Standar Minimal Mutu Kamar Operasi | (Total Operasi - Total Kejadian) / Total Operasi × 100% | 100% |
| 31 | Ketepatan Waktu Makanan (Gizi) | Tepat waktu / total porsi × 100% | > 90% |
| 32 | Sisa Makanan Pasien (Gizi) | Porsi sisa / total porsi × 100% | ≤ 20% |
| 33 | Akurasi Pemberian Diet (Gizi) | Tidak ada kesalahan / total porsi × 100% | 100% |
| 34 | Identifikasi Pasien SIMRS (Gizi) | Sesuai identitas / total pasien ranap × 100% | 100% |

### 7.3 Validasi Form (di `utils/validator.js`)

```javascript
// Fungsi-fungsi yang harus ada di validator.js
validateRequired(value, fieldLabel)       // tidak boleh kosong
validateNoRM(value)                       // alfanumerik, 5-20 karakter
validateTime(value)                       // format HH:MM
validateDate(value)                       // format YYYY-MM-DD
validateTimeOrder(jamAwal, jamAkhir)      // jamAkhir > jamAwal
validatePositiveInt(value, fieldLabel)    // bilangan bulat positif
validateEnum(value, options, fieldLabel)  // harus salah satu dari options
```

### 7.4 Dashboard

Terdiri dari:
- **Baris kartu ringkasan:** total modul ✅ hijau / ⚠️ kuning / ❌ merah dalam periode
- **Tabel rekap:** semua 34 indikator, kolom: Nama Indikator | Nilai | Threshold | Status
- **Bar chart:** 10 indikator dengan nilai terendah (menggunakan Chart.js)
- **Filter:** dropdown bulan, tahun, unit (jika role komite/admin)

### 7.5 Export

- **Export Excel:** SheetJS menghasilkan `.xlsx` multi-sheet, formatnya identik dengan template asli
- **Export PDF:** jsPDF menghasilkan ringkasan satu halaman: nama RS, periode, tabel semua indikator + status warna

---

## 8. UI/UX Guidelines

### 8.1 Layout Umum
```
┌──────────────────────────────────────────────────┐
│  HEADER: Logo | Unit Aktif | Periode | User | Logout │
├─────────────┬────────────────────────────────────┤
│             │                                    │
│  SIDEBAR    │   KONTEN UTAMA                     │
│  Navigasi   │   (Filter bar + Tabel + Summary)   │
│  per grup   │                                    │
│             │                                    │
└─────────────┴────────────────────────────────────┘
```

### 8.2 Grup Navigasi Sidebar

```
📊 Dashboard & Laporan
  - Dashboard
  - Cetak Laporan
─────────────────────
🛡️ Keselamatan Pasien
  - Risiko Jatuh
  - Insiden Keselamatan Pasien
  - Identifikasi Pasien
  - Reaksi Transfusi
  - Gelang Identitas
  - Kepatuhan Kebersihan Tangan
  - Kepatuhan Penggunaan APD
─────────────────────
🏥 Rawat Inap
  - Angka Kematian Ranap
  - Double Check High Alert
  - Visit Dokter Spesialis
  - Kembali ke ICU < 72 Jam
  - Alur Klinis (Clinical Pathway)
─────────────────────
🚨 IGD
  - Waktu Tanggap SC Emergency
  - Emergency Response Time
  - Angka Kematian IGD
  - Asesmen Awal IGD
  - Pasien Tertahan IGD
  - Serah Terima Pasien
─────────────────────
💉 Hemodialisa
  - Ketidakpatuhan Pasien HD
  - Insiden Clotting Durante HD
  - Insiden Jarum Vena Fistula
─────────────────────
🔪 Operasi & Anestesi
  - Penundaan Operasi Elektif (Threshold periodik)
  - Informed Consent Pembedahan
  - Informed Consent Anestesi
  - Asesmen Pra Bedah
  - Asesmen Pra Anestesi
  - Surgical Safety Checklist SC
  - Surgical Safety Checklist Operasi
  - Penandaan Lokasi Operasi
  - Standar Minimal Mutu Kamar Operasi
─────────────────────
🥗 Gizi
  - Ketepatan Waktu Pemberian Makanan
  - Sisa Makanan Yang Tidak Termakan
  - Tidak Adanya Kesalahan Pemberian Diet
  - Kepatuhan Identifikasi Pasien (SIMRS)
─────────────────────
⚙️ Master Data (PIC/Admin)
  - Master Tindakan
─────────────────────
⚙️ Admin (hanya Admin)
  - Kelola User
  - Kelola Unit
  - Kelola Periode
  - Audit Trail
```

### 8.3 Desain Sistem (CSS Variables)

Definisikan di `:root` dalam `main.css`:

```css
:root {
  --color-primary:    #1a6eb5;
  --color-success:    #28a745;
  --color-warning:    #ffc107;
  --color-danger:     #dc3545;
  --color-text:       #212529;
  --color-muted:      #6c757d;
  --color-border:     #dee2e6;
  --color-bg:         #f8f9fa;
  --color-sidebar-bg: #1e293b;
  --color-sidebar-text: #cbd5e1;

  --font-main: 'Segoe UI', system-ui, sans-serif;
  --font-size-base: 14px;
  --radius: 6px;
  --shadow: 0 1px 3px rgba(0,0,0,0.12);
  --sidebar-width: 240px;
  --header-height: 56px;
}
```

### 8.4 Status Badge Indikator
- 🟢 **Hijau** (`--color-success`): nilai ≥ threshold
- 🟡 **Kuning** (`--color-warning`): nilai 70–99% dari threshold
- 🔴 **Merah** (`--color-danger`): nilai < 70% dari threshold

### 8.5 Tabel Data
- Kolom sortable (klik header → toggle asc/desc)
- Pagination: 10 / 25 / 50 baris per halaman
- Baris dengan `nilai_n = 0` diberi background `#fff5f5`
- Baris total/ringkasan di bawah tabel dengan background `#f0f4ff` dan font-weight bold

---

## 9. Non-Functional Requirements

| Aspek | Requirement |
|---|---|
| Performa | Halaman load < 3 detik pada koneksi intranet RS |
| Keamanan | bcrypt (cost 12), JWT 8 jam, refresh token HttpOnly cookie, HTTPS di production |
| Ketersediaan | 99% uptime jam kerja 07.00–21.00 |
| Kapasitas | 20 user concurrent minimum |
| Browser | Chrome 90+, Firefox 88+, Edge 90+ |
| Responsive | Minimum tablet 768px; mobile tidak diprioritaskan v1.0 |
| Audit Trail | Semua create/update/delete dicatat di tabel `audit_log` |
| Backup | mysqldump otomatis setiap hari pukul 01.00, disimpan 30 hari |
| Aksesibilitas | Label form lengkap, kontras warna WCAG AA minimum |

---

## 10. Batasan & Asumsi

- Satu periode = satu bulan kalender
- Data periode tertutup tidak bisa diubah, kecuali Admin
- Satu pasien (No RM) bisa muncul di beberapa modul dalam periode yang sama
- Import Excel hanya untuk migrasi data awal
- Tidak ada integrasi dengan SIMRS, SIRS Online, atau sistem eksternal di v1.0
- Tidak menggunakan build tool (webpack/vite) di frontend — semua JS langsung dimuat browser via `<script type="module">`

---

## 11. Milestones

| Fase | Scope | Estimasi |
|---|---|---|
| **Fase 1** | Setup proyek (struktur folder, Nginx, Docker), Auth, Master Data, Router & Store, Layout (sidebar+header), 5 modul prioritas: Risiko Jatuh, Identifikasi Pasien, Insiden Keselamatan, Waktu Tanggap SC, Alur Klinis | 3 minggu |
| **Fase 2** | 12 modul Rawat Inap + IGD + Dashboard (kartu + chart + tabel rekap) | 3 minggu |
| **Fase 3** | 10 modul HD + Operasi + Export Excel & PDF | 2 minggu |
| **Fase 4** | Import Excel lama, Admin panel (user/periode/audit), UAT, bug fixing, deployment production | 2 minggu |

**Total estimasi:** ~10 minggu

---

## 12. Instruksi untuk AI Code Generator

Saat men-generate kode berdasarkan PRD ini, ikuti aturan berikut **tanpa pengecualian**:

```
FRONTEND:
- Murni Vanilla JS (ES6+) — DILARANG menggunakan React, Vue, Angular, Svelte,
  atau framework JS apapun
- Gunakan ES Modules native (<script type="module">) — tidak perlu webpack/vite/babel
- Satu-satunya library yang boleh dimuat via CDN: Chart.js, SheetJS (xlsx), jsPDF
- Semua manipulasi DOM menggunakan document.querySelector, innerHTML, addEventListener
- State management cukup dengan plain JS object di store.js
- Routing menggunakan window.location.hash + hashchange event
- Tidak ada inline style — semua style di file CSS terpisah menggunakan CSS variables
- Setiap halaman modul harus export fungsi render(container) dan destroy()
- Validasi form harus menggunakan fungsi dari utils/validator.js, bukan library eksternal
- Kalkulasi otomatis (selisih menit, nilai N, persentase) harus ada di utils/calculator.js

BACKEND:
- Node.js + Express.js dengan CommonJS (require/module.exports)
- Prisma sebagai ORM — jangan tulis raw SQL kecuali untuk query agregat kompleks
- Validasi input menggunakan express-validator
- JWT disimpan: access token di Authorization header, refresh token di HttpOnly cookie
- Nilai indikator (N, numerator, denominator, %) TIDAK disimpan di DB —
  dihitung dinamis di service layer saat query
- Setiap modul memiliki 3 file: [nama].route.js, [nama].controller.js, [nama].service.js
- Error handler global di middleware/errorHandler.js
- Semua response menggunakan format { success, data, meta } atau { success, message, errors }
- Gunakan dotenv untuk semua konfigurasi environment

DATABASE:
- MySQL 8.0 — definisikan schema via Prisma schema.prisma
- Setiap tabel indikator wajib punya: created_by (FK ke users), created_at, updated_at
- Setiap tabel indikator wajib punya: periode_id (FK ke periode), unit_id (FK ke units)
- Buat index pada kolom periode_id dan unit_id di setiap tabel indikator
```