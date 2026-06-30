# PANDUAN MENAMBAH MODUL INDIKATOR BARU (SIMURS)

Panduan lengkap ini menjelaskan langkah demi langkah untuk menambahkan modul indikator mutu baru (ke-28 dan seterusnya) ke dalam sistem SIMURS secara manual.

---

## 🛠️ Ringkasan Alur Kerja

```
DATABASE                     BACKEND                      FRONTEND
┌────────────────────────┐   ┌────────────────────────┐   ┌────────────────────────┐
│ 1. Schema Prisma       │ ─>│ 2. Buat Service.js     │ ─>│ 5. Tambah di           │
│    (Definisi Model)    │   │ 3. Buat Controller.js  │   │    config/modules.js   │
│                        │   │ 4. Buat Route.js &     │   │ 6. Tambah di router.js │
│    npx prisma db push  │   │    Daftarkan ke index  │   │ 7. Buat Halaman JS     │
└────────────────────────┘   └────────────────────────┘   └────────────────────────┘
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
│   │   │   └── modules/
│   │   │       └── indikator-baru.controller.js # [Baru] Controller API request-response
│   │   └── services/
│   │       └── modules/
│   │           └── indikator-baru.service.js    # [Baru] Service logic & query Prisma
│
└── frontend/
    └── js/
        ├── config/
        │   └── modules.js                   # [Ubah] Tambah modul ke sidebar navigation
        ├── router.js                        # [Ubah] Daftarkan hash URL & dynamic import
        └── pages/
            └── modules/
                └── indikator-baru.js        # [Baru] UI page, layout form modal, dan render data
```

---

## 📝 TAHAP 1: DATABASE (PRISMA SCHEMA)

### 1. Tambah Model Baru di `schema.prisma`
Buka file `backend/src/prisma/schema.prisma` dan tambahkan model indikator baru di bagian bawah file. 

> [!IMPORTANT]
> Setiap tabel indikator wajib berelasi dengan:
> * `Periode` (`periode_id`)
> * `Unit` (`unit_id`)
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
  kriteria_1    String   // e.g. "dilakukan" / "tidak_dilakukan"
  kriteria_2    String
  
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

### 1. Buat Service Baru
Buat file `backend/src/services/modules/indikator-baru.service.js` untuk mengelola query database ke database MySQL via Prisma Client.

```javascript
const prisma = require('../../config/database');

async function getAll(where, page, limit) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.indikatorBaru.findMany({ where, skip, take: limit, orderBy: { created_at: 'desc' } }),
    prisma.indikatorBaru.count({ where }),
  ]);
  return { data, total };
}

// Lakukan normalisasi jika ada opsi ber-spasi dari frontend
function normalizeData(data) {
  if (data.kriteria_1 === 'tidak dilakukan') data.kriteria_1 = 'tidak_dilakukan';
  if (data.kriteria_2 === 'tidak dilakukan') data.kriteria_2 = 'tidak_dilakukan';
}

async function create(body, userId) {
  const data = { ...body, created_by: userId };
  if (data.periode_id) data.periode_id = parseInt(data.periode_id);
  if (data.unit_id) data.unit_id = parseInt(data.unit_id);
  normalizeData(data);
  return prisma.indikatorBaru.create({ data });
}

async function update(id, body) {
  const data = { ...body };
  if (data.periode_id) data.periode_id = parseInt(data.periode_id);
  if (data.unit_id) data.unit_id = parseInt(data.unit_id);
  normalizeData(data);
  return prisma.indikatorBaru.update({ where: { id }, data });
}

async function remove(id) {
  return prisma.indikatorBaru.delete({ where: { id } });
}

async function getSummary(where) {
  const data = await prisma.indikatorBaru.findMany({ where });
  const total = data.length;
  
  // Rumus hitung nilai patuh (Numerator)
  const patuh = data.filter(d => 
    d.kriteria_1 === 'dilakukan' && d.kriteria_2 === 'dilakukan'
  ).length;

  const persen = total > 0 ? ((patuh / total) * 100).toFixed(2) : 0;
  return { total, numerator: patuh, persen, standar: '100%' };
}

module.exports = { getAll, create, update, remove, getSummary };
```

### 2. Buat Controller Baru
Buat file `backend/src/controllers/modules/indikator-baru.controller.js` untuk menerima data request dari API dan mengirimkan JSON response.

```javascript
const service = require('../../services/modules/indikator-baru.service');

async function getAll(req, res, next) {
  try {
    const { periode_id, unit_id, page = 1, limit = 10 } = req.query;
    const where = {};
    if (periode_id) where.periode_id = parseInt(periode_id);
    if (unit_id) where.unit_id = parseInt(unit_id);
    const result = await service.getAll(where, parseInt(page), parseInt(limit));
    res.json({ success: true, data: result.data, meta: { total: result.total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const data = await service.create(req.body, req.user.id);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const data = await service.update(parseInt(req.params.id), req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await service.remove(parseInt(req.params.id));
    res.json({ success: true, message: 'Data berhasil dihapus' });
  } catch (err) { next(err); }
}

async function getSummary(req, res, next) {
  try {
    const { periode_id, unit_id } = req.query;
    const where = {};
    if (periode_id) where.periode_id = parseInt(periode_id);
    if (unit_id) where.unit_id = parseInt(unit_id);
    const summary = await service.getSummary(where);
    res.json({ success: true, data: summary });
  } catch (err) { next(err); }
}

module.exports = { getAll, create, update, remove, getSummary };
```

### 3. Buat File Rute Baru
Buat file `backend/src/routes/modules/indikator-baru.js` untuk memetakan endpoint rute API dan memverifikasi otorisasi user.

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
  body('nama_pasien').notEmpty().withMessage('Nama pasien wajib diisi'),
  body('no_rm').notEmpty().withMessage('No RM wajib diisi'),
  body('kriteria_1').isIn(['dilakukan', 'tidak dilakukan', 'tidak_dilakukan']).withMessage('Nilai kriteria 1 tidak valid'),
  body('kriteria_2').isIn(['dilakukan', 'tidak dilakukan', 'tidak_dilakukan']).withMessage('Nilai kriteria 2 tidak valid'),
], validate, ctrl.create);

router.put('/:id', ctrl.update);
router.delete('/:id', checkRole('admin', 'pic_mutu'), ctrl.remove);

module.exports = router;
```

### 4. Daftarkan Rute Baru
Buka file `backend/src/routes/index.js` dan daftarkan modul rute baru Anda:
```javascript
// Tambahkan baris berikut di kelompok rute modul indikator yang sesuai:
router.use('/indikator-baru', require('./modules/indikator-baru'));
```

---

## 🎨 TAHAP 3: FRONTEND (USER INTERFACE)

### 1. Daftarkan di Modul Sidebar Navigation
Buka file `frontend/js/config/modules.js`. Cari kelompok menu yang sesuai (contoh: **Keselamatan Pasien**) lalu daftarkan menu baru:
```javascript
      { label: 'Indikator Baru', hash: '#/indikator-baru' },
```

### 2. Daftarkan Rute di Router Frontend
Buka file `frontend/js/router.js`. Masukkan rute hash URL baru beserta dynamic module loading-nya ke objek `routes`:
```javascript
  '#/indikator-baru': { module: () => import('./pages/modules/indikator-baru.js'), title: 'Indikator Baru Pelayanan' },
```

### 3. Buat File Halaman Frontend JS
Buat file baru di `frontend/js/pages/modules/indikator-baru.js`. File ini menggunakan struktur SPA universal yang mengimpor komponen helper dari `generic-indicator.js`.

```javascript
import { createIndicatorModule } from './generic-indicator.js';

export const { render, destroy } = createIndicatorModule({
  // Identitas endpoint & nama tabel
  apiEndpoint: '/indikator-baru',
  moduleTitle: 'Indikator Baru Pelayanan',

  // 1. Daftar Kolom Tabel Data Utama
  tableColumns: [
    { label: 'No', render: (_, i) => i + 1 },
    { label: 'Tanggal', key: 'tanggal', render: (r) => new Date(r.tanggal).toLocaleDateString('id-ID') },
    { label: 'Nama Pasien', key: 'nama_pasien' },
    { label: 'No. RM', key: 'no_rm' },
    { 
      label: 'Kriteria 1', 
      key: 'kriteria_1',
      render: (r) => r.kriteria_1 === 'dilakukan'
        ? '<span class="badge badge-success">Dilakukan</span>'
        : '<span class="badge badge-danger">Tidak Dilakukan</span>'
    },
    { 
      label: 'Kriteria 2', 
      key: 'kriteria_2',
      render: (r) => r.kriteria_2 === 'dilakukan'
        ? '<span class="badge badge-success">Dilakukan</span>'
        : '<span class="badge badge-danger">Tidak Dilakukan</span>'
    }
  ],

  // 2. Form Tambah / Edit Data Pasien di Modal
  formFieldsHTML: (data = null, state = {}) => {
    // Normalisasi value untuk option agar sesuai dengan database (yang mengandung spasi)
    const kriteria1 = data?.kriteria_1 === 'tidak_dilakukan' ? 'tidak dilakukan' : (data?.kriteria_1 || 'dilakukan');
    const kriteria2 = data?.kriteria_2 === 'tidak_dilakukan' ? 'tidak dilakukan' : (data?.kriteria_2 || 'dilakukan');

    return `
      <div class="form-group">
        <label class="form-label">Tanggal <span class="required">*</span></label>
        <input type="date" name="tanggal" class="form-control" value="${data?.tanggal ? data.tanggal.substring(0, 10) : ''}" required>
      </div>
      <div class="form-group">
        <label class="form-label">Nama Pasien <span class="required">*</span></label>
        <input type="text" name="nama_pasien" class="form-control" value="${data?.nama_pasien || ''}" required>
      </div>
      <div class="form-group">
        <label class="form-label">No. RM <span class="required">*</span></label>
        <input type="text" name="no_rm" class="form-control" value="${data?.no_rm || ''}" required placeholder="00-00-00">
      </div>
      <div class="form-group">
        <label class="form-label">Kriteria 1 <span class="required">*</span></label>
        <select name="kriteria_1" class="form-control" required>
          <option value="dilakukan" ${kriteria1 === 'dilakukan' ? 'selected' : ''}>Dilakukan</option>
          <option value="tidak dilakukan" ${kriteria1 === 'tidak dilakukan' ? 'selected' : ''}>Tidak Dilakukan</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Kriteria 2 <span class="required">*</span></label>
        <select name="kriteria_2" class="form-control" required>
          <option value="dilakukan" ${kriteria2 === 'dilakukan' ? 'selected' : ''}>Dilakukan</option>
          <option value="tidak dilakukan" ${kriteria2 === 'tidak dilakukan' ? 'selected' : ''}>Tidak Dilakukan</option>
        </select>
      </div>
    `;
  },

  // 3. Validasi Form Sisi Klien (Client-side) sebelum disubmit ke backend
  validateForm: (formData, utils) => {
    return utils.validateForm({
      tanggal: utils.validateDate(formData.tanggal),
      nama_pasien: utils.validateRequired(formData.nama_pasien, 'Nama Pasien'),
      no_rm: utils.validateNoRM(formData.no_rm),
    });
  }
});
```

---

## ✅ VERIFIKASI AKHIR

Setelah semua kode di atas ditulis, lakukan langkah-langkah berikut untuk menguji modul:
1. Restart server node.js jika Anda tidak mengaktifkan hot reload / watch mode.
2. Login sebagai **Admin** ke dashboard SIMURS.
3. Buka menu **Kelola Pengguna** lalu edit akun Petugas atau PIC Mutu.
4. Pastikan menu **Indikator Baru** kini terdaftar di checklist hak akses modul, centang modul tersebut, lalu simpan.
5. Login menggunakan akun Petugas / PIC Mutu yang diberikan akses tadi, dan pastikan menu baru muncul di sidebar dan form input data dapat berjalan normal untuk menyimpan, mengedit, maupun menghapus data.
