# PANDUAN MENAMBAH MODUL INDIKATOR BARU (SIMURS)

Panduan ini menjelaskan langkah demi langkah untuk menambahkan modul indikator mutu baru ke dalam sistem SIMURS menggunakan arsitektur generik terbaru (Backend & Frontend) guna mempercepat pengembangan dan menjaga konsistensi kode.

---

## 🛠️ Ringkasan Alur Kerja

```
DATABASE                     BACKEND & REGISTRASI SENTRAL              FRONTEND
┌────────────────────────┐   ┌─────────────────────────────────────┐   ┌────────────────────────┐
│ 1. Schema Prisma       │ ─>│ 2. Buat Service (Generic Service)   │ ─>│ 6. Tambah di           │
│    (Definisi Model)    │   │ 3. Buat Controller (Generic Ctrl)   │   │    config/modules.js   │
│                        │   │ 4. Buat Route & Daftarkan ke index  │   │ 7. Tambah di router.js │
│    npx prisma db push  │   │ 5. Daftarkan di Dashboard & Laporan │   │ 8. Buat Halaman JS     │
└────────────────────────┘   └─────────────────────────────────────┘   └────────────────────────┘
```

---

## 📂 Peta Struktur File Yang Perlu Dibuat / Diubah

Berikut adalah daftar file yang harus Anda buat atau ubah:

```
simurs/
├── backend/
│   ├── src/
│   │   ├── prisma/
│   │   │   └── schema.prisma                # [Ubah] Tambah model tabel baru
│   │   ├── routes/
│   │   │   ├── index.js                     # [Ubah] Daftarkan rute API baru
│   │   │   └── modules/
│   │   │       └── indikator-baru.js        # [Baru] Validasi express-validator & rute
│   │   ├── controllers/
│   │   │   ├── dashboard.controller.js      # [Ubah] Daftarkan hitungan dashboard & summary
│   │   │   ├── laporan.controller.js        # [Ubah] Daftarkan service untuk ekspor Excel
│   │   │   └── modules/
│   │   │       └── indikator-baru.controller.js # [Baru] Controller generik (3 baris kode!)
│   │   └── services/
│   │       └── modules/
│   │           └── indikator-baru.service.js    # [Baru] Service logic mewarisi Generic Service
│   │
│   └── frontend/
│       └── js/
│           ├── config/
│           │   └── modules.js               # [Ubah] Tambah modul ke sidebar navigation & permission
│           ├── router.js                    # [Ubah] Daftarkan hash URL & dynamic import
│           └── pages/
│               └── modules/
│                   └── indikator-baru.js    # [Baru] UI page berbasis createGenericIndicatorPage
```

---

## 📝 TAHAP 1: DATABASE (PRISMA SCHEMA)

### 1. Tambah Model Baru di `schema.prisma`
Buka file `backend/src/prisma/schema.prisma` dan tambahkan model indikator baru di bagian bawah file.

> [!IMPORTANT]
> Setiap tabel indikator wajib berelasi dengan:
> * `Periode` (`periode_id`)
> * `Unit` (`unit_id`) - kecuali jika indikator bersifat global/mengabaikan unit (`ignoreUnit`).
> * `User` (`created_by` sebagai pembuat record)

**Contoh Template Model:**
```prisma
model IndikatorBaru {
  id            Int      @id @default(autoincrement())
  periode_id    Int
  unit_id       Int
  tanggal       DateTime @db.Date
  nama_pasien   String   @db.VarChar(100)
  no_rm         String   @db.VarChar(20)
  
  // Field spesifik indikator Anda:
  jumlah_pemeriksaan Int
  kepatuhan_pengisian Int
  kriteria_status     String   // e.g. "dilakukan" / "tidak_dilakukan"
  
  created_by    Int
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  // Relasi
  periode       Periode  @relation(fields: [periode_id], references: [id])
  unit          Unit     @relation(fields: [unit_id], references: [id])
  user          User     @relation(fields: [created_by], references: [id])

  @@index([periode_id])
  @@index([unit_id])
  @@map("indikator_baru") // Nama tabel fisik di database MySQL
}
```

### 2. Push Perubahan ke Database
Buka terminal Anda, masuk ke direktori `backend` dan jalankan sinkronisasi database:
```bash
npx prisma db push --schema=src/prisma/schema.prisma
```

---

## 💻 TAHAP 2: BACKEND (API ENDPOINTS)

### 1. Buat Service Baru Menggunakan Generic Service
Buat file `backend/src/services/modules/indikator-baru.service.js`. Kita mengimpor `createGenericService` untuk menghindari penulisan query CRUD manual.

> [!NOTE]
> **Coerce Types Otomatis:** `generic.service.js` secara otomatis melakukan casting/konversi tipe data sebelum menyimpan data ke DB:
> * Menormalkan nilai enum dengan spasi (e.g. `"tidak dilakukan"` menjadi `"tidak_dilakukan"`).
> * Mengubah string `"true"` / `"false"` menjadi boolean riil `true` / `false`.
> * Mengubah string angka menjadi integer secara otomatis untuk field yang berakhiran `_id`, diawali dengan `jumlah_` atau `total_`, berakhiran `_kolf`, serta kata kunci khusus seperti `usia` dan `selisih_menit`.
> * Mengonversi field berawalan `tanggal` dan `jam` menjadi tipe `Date`.

```javascript
const { createGenericService } = require('./generic.service');

const baseService = createGenericService('indikatorBaru', {
  // Option: ignoreUnitId: true // Aktifkan jika modul ini bersifat global tanpa filter unit_id
  
  // Hook sebelum data disimpan ke database (Create)
  beforeCreate(data) {
    if (data.jumlah_pemeriksaan !== undefined) data.jumlah_pemeriksaan = parseInt(data.jumlah_pemeriksaan) || 0;
    if (data.kepatuhan_pengisian !== undefined) data.kepatuhan_pengisian = parseInt(data.kepatuhan_pengisian) || 0;
    return data;
  },

  // Hook sebelum data diperbarui di database (Update)
  beforeUpdate(data) {
    if (data.jumlah_pemeriksaan !== undefined) data.jumlah_pemeriksaan = parseInt(data.jumlah_pemeriksaan) || 0;
    if (data.kepatuhan_pengisian !== undefined) data.kepatuhan_pengisian = parseInt(data.kepatuhan_pengisian) || 0;
    return data;
  },

  // Logika kalkulasi summary untuk visualisasi & laporan
  calculateSummary(data) {
    const total = data.length;
    const totalPemeriksaan = data.reduce((sum, d) => sum + (d.jumlah_pemeriksaan || 0), 0);
    const totalKepatuhan = data.reduce((sum, d) => sum + (d.kepatuhan_pengisian || 0), 0);

    const persen = totalPemeriksaan > 0 ? parseFloat(((totalKepatuhan / totalPemeriksaan) * 100).toFixed(2)) : 0;

    return {
      total,
      numerator: totalKepatuhan,
      denominator: totalPemeriksaan,
      persen,
      standar: '≥ 85%',
      category: 'Kategori Anda' // e.g. 'Radiologi', 'Gizi', 'Keselamatan Pasien'
    };
  }
});

// Opsional: Override method default (misal getAll) jika ingin menyisipkan field virtual hasil hitung
const originalGetAll = baseService.getAll;
baseService.getAll = async function(where, page, limit) {
  const result = await originalGetAll(where, page, limit);
  result.data = result.data.map(d => {
    const jp = d.jumlah_pemeriksaan || 0;
    const kp = d.kepatuhan_pengisian || 0;
    return {
      ...d,
      hasil: jp > 0 ? parseFloat(((kp / jp) * 100).toFixed(2)) : 0
    };
  });
  return result;
};

module.exports = baseService;
```

### 2. Buat Controller Baru Menggunakan Generic Controller
Buat file `backend/src/controllers/modules/indikator-baru.controller.js`. Karena seluruh logika ditangani oleh Controller Generik, Anda hanya membutuhkan 3 baris kode!

```javascript
const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/indikator-baru.service');

module.exports = createGenericController(service);
```

### 3. Buat File Rute Baru
Buat file `backend/src/routes/modules/indikator-baru.js`:

```javascript
const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/indikator-baru.controller');

router.use(verifyToken);

router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);

router.post('/', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  body('unit_id').isInt().withMessage('Unit wajib dipilih'),
  body('tanggal').notEmpty().withMessage('Tanggal wajib diisi'),
  body('jumlah_pemeriksaan').isInt({ min: 1 }).withMessage('Jumlah pemeriksaan wajib minimal 1'),
  body('kepatuhan_pengisian').isInt({ min: 0 }).withMessage('Kepatuhan pengisian wajib berupa angka non-negatif'),
], validate, ctrl.create);

router.put('/:id', ctrl.update);
router.delete('/:id', checkRole('admin', 'pic_mutu'), ctrl.remove);

module.exports = router;
```

### 4. Daftarkan Rute ke Index Routes
Buka file `backend/src/routes/index.js` dan tambahkan rute baru di kelompok modul indikator yang sesuai:
```javascript
router.use('/indikator-baru', require('./modules/indikator-baru'));
```

---

## 📊 TAHAP 3: REGISTRASI SENTRAL BACKEND (DASHBOARD & LAPORAN)

Agar indikator baru terintegrasi ke dalam sistem pelaporan pusat SIMURS, Anda **wajib** melakukan registrasi berikut:

### 1. Daftarkan di Dashboard Controller (`backend/src/controllers/dashboard.controller.js`)
* Tambahkan variabel model Prisma ke array destructured di fungsi `getSummary` (sekitar line 11-25):
  ```javascript
  // Contoh:
  const [
    ...,
    indikatorBaru
  ] = await Promise.all([
    ...,
    prisma.indikatorBaru.count({ where }),
  ]);
  ```
* Tambahkan ke objek `totalRecords` di dalam response JSON (sekitar line 77-92):
  ```javascript
  totalRecords: {
    ...,
    indikatorBaru
  }
  ```
* Impor service baru di objek `services` (sekitar line 97-170):
  ```javascript
  'Nama Indikator Lengkap': { service: require('../services/modules/indikator-baru.service'), category: 'Kategori Anda' },
  ```

### 2. Daftarkan di Laporan Controller (`backend/src/controllers/laporan.controller.js`)
* Impor service baru di objek `services` (sekitar line 5-71):
  ```javascript
  'Nama Indikator Lengkap': { service: require('../services/modules/indikator-baru.service'), table: 'indikatorBaru', category: 'Kategori Anda' },
  ```
* Jika indikator memiliki formula kalkulasi pencapaian khusus untuk diekspor ke Excel, tambahkan kondisi pemetaan di bagian loop `exportExcel` (sekitar line 164-193):
  ```javascript
  } else if (cfg.table === 'indikatorBaru') {
    const jp = r.jumlah_pemeriksaan || 0;
    const kp = r.kepatuhan_pengisian || 0;
    hasilVal = jp > 0 ? `${parseFloat(((kp / jp) * 100).toFixed(2))}%` : '0%';
  }
  ```

---

## 🎨 TAHAP 4: FRONTEND (USER INTERFACE)

### 1. Daftarkan di Modul Sidebar Navigation
Buka file `frontend/js/config/modules.js`. Cari kelompok menu yang sesuai (contoh: **Mutu Radiologi**) lalu daftarkan item baru:
```javascript
      { label: 'Indikator Baru', hash: '#/indikator-baru' },
```

### 2. Daftarkan Rute di Router Frontend
Buka file `frontend/js/router.js`. Masukkan rute hash URL baru beserta dynamic module loading-nya ke objek `routes`:
```javascript
  '#/indikator-baru': { module: () => import('./pages/modules/indikator-baru.js'), title: 'Indikator Baru Pelayanan' },
```

### 3. Buat File Halaman Frontend JS Menggunakan createGenericIndicatorPage
Buat file baru di `frontend/js/pages/modules/indikator-baru.js`. Gunakan fungsi pabrik `createGenericIndicatorPage` dari `generic-indicator.js` untuk membuat halaman antarmuka secara instan.

```javascript
import { createGenericIndicatorPage } from './generic-indicator.js';
import { renderBadge } from '../../components/indicator-badge.js';

const page = createGenericIndicatorPage({
  title: 'Indikator Baru Pelayanan',
  subtitle: 'Deskripsi indikator mutu baru pelayanan rumah sakit',
  endpoint: '/indikator-baru', // Endpoint API Backend yang telah dibuat
  
  // 1. Daftar Kolom Tabel Data Utama
  columns: [
    { 
      label: 'Tanggal', 
      render: (r) => new Date(r.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    },
    { label: 'Jumlah Pemeriksaan (D)', key: 'jumlah_pemeriksaan' },
    { label: 'Kepatuhan Pengisian (N)', key: 'kepatuhan_pengisian' },
    { 
      label: 'Hasil', 
      render: (r) => `${r.hasil || 0}%`
    }
  ],

  // 2. Definisi Field untuk Form Tambah / Edit Modal
  fields: [
    {
      name: 'tanggal',
      label: 'Tanggal',
      type: 'date',
      required: true,
      row: 1 // Baris 1 kolom kiri
    },
    {
      name: 'jumlah_pemeriksaan',
      label: 'Jumlah Pemeriksaan',
      type: 'number',
      required: true,
      row: 1 // Baris 1 kolom kanan
    },
    {
      name: 'kepatuhan_pengisian',
      label: 'Kepatuhan Pengisian',
      type: 'number',
      required: true,
      row: 2
    }
  ],

  // 3. Custom Tampilan Summary Card (Numerator & Denominator)
  calculateSummaryHTML: (s) => {
    const total = s.total || 0;
    const numerator = s.numerator || 0;
    const denominator = s.denominator || 0;
    const persen = s.persen || 0;
    const standar = s.standar || '≥ 85%';
    
    return `
      <div class="summary-card-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; width: 100%;">
        <div class="summary-item"><div class="summary-value">${total}</div><div class="summary-label">Total Data</div></div>
        <div class="summary-item"><div class="summary-value">${numerator}</div><div class="summary-label">Kepatuhan Pengisian (N)</div></div>
        <div class="summary-item"><div class="summary-value">${denominator}</div><div class="summary-label">Jumlah Pemeriksaan (D)</div></div>
        <div class="summary-item"><div class="summary-value">${persen}%</div><div class="summary-label">Persentase</div></div>
        <div class="summary-item">
          ${renderBadge(persen, standar)}
          <div class="summary-label" style="margin-top:8px">Standar: ${standar}</div>
        </div>
      </div>
    `;
  }
});

export default page;
```

---

## ✅ VERIFIKASI AKHIR

Setelah semua kode ditulis, jalankan pengujian berikut untuk memastikan modul berfungsi dengan baik:
1. Jalankan restart server Node.js jika perlu.
2. Login sebagai akun **Admin** ke dashboard SIMURS.
3. Buka menu **Kelola Pengguna** lalu edit akun Petugas atau PIC Mutu yang akan menguji modul.
4. Pastikan menu **Indikator Baru** kini terdaftar di checklist hak akses modul, centang modul tersebut, lalu simpan.
5. Login menggunakan akun Petugas / PIC Mutu tersebut.
6. Pastikan menu baru muncul di sidebar dan form input data dapat berjalan normal untuk menyimpan, mengedit, maupun menghapus data.
7. Buka menu **Cetak Laporan** dan ekspor file Excel untuk periode saat ini, pastikan data indikator baru terekspor dengan benar di sheet khusus dan terakumulasi di sheet "Ringkasan Mutu".
