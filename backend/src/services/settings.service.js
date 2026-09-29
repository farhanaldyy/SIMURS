const prisma = require('../config/database');
const { AVAILABLE_INDICATORS } = require('../config/indicators.config');

const DEFAULT_INFO = {
  nama_rs: 'RS Islam Kalimantan Muhammad Arsyad Al Banjari',
  kode_rs: '6371012',
  alamat: 'Jl. S. Parman No. 88',
  telepon: '(0511) 3354884',
  email: 'rsik.banjarmasin@gmail.com',
  website: 'https://rsik-banjarmasin.co.id',
  logo_url: 'assets/img/logo.png',
  nama_direktur: 'dr. H. Mastemer, Sp.B',
  nip_direktur: '19700101 200003 1 001',
  kota: 'Banjarmasin',
  deskripsi: 'Sistem Informasi Mutu Rumah Sakit — Menjaga Mutu dan Keselamatan Pasien',
  integration_mode: 'sandbox',
  kode_fasyankes: '6371012',
  inm_api_url: 'https://mutufasyankes.kemkes.go.id/api/v1',
  inm_api_key: '',
  inm_secret_key: '',
  simar_api_url: 'https://simar-api.kemkes.go.id/v1',
  simar_api_key: '',
  satusehat_org_id: '',
  satusehat_client_key: '',
  satusehat_secret_key: '',
};

// Top INM Kemenkes Official Standard Codes Preset
const OFFICIAL_INM_PRESETS = {
  'kepatuhan_kebersihan_tangan': { kode: 'INM-01', nama: 'Kepatuhan Kebersihan Tangan', target: 85, satuan: '%' },
  'kepatuhan_apd': { kode: 'INM-02', nama: 'Kepatuhan Penggunaan Alat Pelindung Diri (APD)', target: 100, satuan: '%' },
  'identifikasi_pasien': { kode: 'INM-03', nama: 'Kepatuhan Identifikasi Pasien', target: 100, satuan: '%' },
  'waktu_tunggu_poliklinik': { kode: 'INM-04', nama: 'Waktu Tunggu Rawat Jalan', target: 80, satuan: '%' },
  'penundaan_operasi': { kode: 'INM-05', nama: 'Penundaan Operasi Elektif', target: 5, satuan: '%' },
  'visit_dokter': { kode: 'INM-06', nama: 'Kepatuhan Visite Dokter Spesialis', target: 80, satuan: '%' },
  'kepatuhan_fornas': { kode: 'INM-07', nama: 'Kepatuhan Penggunaan Formularium Nasional', target: 80, satuan: '%' },
  'alur_klinis': { kode: 'INM-08', nama: 'Kepatuhan Terhadap Alur Klinis (Clinical Pathway)', target: 80, satuan: '%' },
  'risiko_jatuh': { kode: 'INM-09', nama: 'Kepatuhan Upaya Pencegahan Risiko Pasien Jatuh', target: 100, satuan: '%' },
  'emergency_response_time': { kode: 'INM-10', nama: 'Waktu Tanggap Pelayanan Gawat Darurat', target: 80, satuan: '%' },
  'gizi_sisa_makanan': { kode: 'INM-11', nama: 'Sisa Makanan Pasien Yang Tidak Termakan', target: 20, satuan: '%' },
  'mutu_rekam_medis': { kode: 'INM-12', nama: 'Kelengkapan Pengisian Rekam Medis 24 Jam', target: 100, satuan: '%' },
  'insiden_keselamatan': { kode: 'INM-13', nama: 'Pelaporan Insiden Keselamatan Pasien', target: 100, satuan: '%' },
};

async function getSettings() {
  let info = await prisma.informasiRumahSakit.findFirst();
  if (!info) {
    info = await prisma.informasiRumahSakit.create({
      data: DEFAULT_INFO,
    });
  }
  return info;
}

async function updateSettings(data) {
  let info = await getSettings();

  const payload = {
    nama_rs: data.nama_rs !== undefined ? data.nama_rs : info.nama_rs,
    kode_rs: data.kode_rs !== undefined ? data.kode_rs : info.kode_rs,
    alamat: data.alamat !== undefined ? data.alamat : info.alamat,
    telepon: data.telepon !== undefined ? data.telepon : info.telepon,
    email: data.email !== undefined ? data.email : info.email,
    website: data.website !== undefined ? data.website : info.website,
    logo_url: data.logo_url !== undefined && data.logo_url !== '' ? data.logo_url : info.logo_url,
    nama_direktur: data.nama_direktur !== undefined ? data.nama_direktur : info.nama_direktur,
    nip_direktur: data.nip_direktur !== undefined ? data.nip_direktur : info.nip_direktur,
    kota: data.kota !== undefined ? data.kota : info.kota,
    deskripsi: data.deskripsi !== undefined ? data.deskripsi : info.deskripsi,
    integration_mode: data.integration_mode !== undefined ? data.integration_mode : info.integration_mode,
    kode_fasyankes: data.kode_fasyankes !== undefined ? data.kode_fasyankes : info.kode_fasyankes,
    inm_api_url: data.inm_api_url !== undefined ? data.inm_api_url : info.inm_api_url,
    inm_api_key: data.inm_api_key !== undefined ? data.inm_api_key : info.inm_api_key,
    inm_secret_key: data.inm_secret_key !== undefined ? data.inm_secret_key : info.inm_secret_key,
    simar_api_url: data.simar_api_url !== undefined ? data.simar_api_url : info.simar_api_url,
    simar_api_key: data.simar_api_key !== undefined ? data.simar_api_key : info.simar_api_key,
    satusehat_org_id: data.satusehat_org_id !== undefined ? data.satusehat_org_id : info.satusehat_org_id,
    satusehat_client_key: data.satusehat_client_key !== undefined ? data.satusehat_client_key : info.satusehat_client_key,
    satusehat_secret_key: data.satusehat_secret_key !== undefined ? data.satusehat_secret_key : info.satusehat_secret_key,
  };

  return await prisma.informasiRumahSakit.update({
    where: { id: info.id },
    data: payload,
  });
}

async function getInmMappings() {
  let mappings = await prisma.inmIndicatorMapping.findMany({
    orderBy: { id: 'asc' },
  });

  if (mappings.length === 0) {
    // Seed initial mappings from AVAILABLE_INDICATORS & presets
    const seedData = AVAILABLE_INDICATORS.map((ind) => {
      const preset = OFFICIAL_INM_PRESETS[ind.id];
      return {
        indicator_id: ind.id,
        nama_indikator_internal: ind.nama,
        kode_inm_kemenkes: preset ? preset.kode : null,
        nama_inm_kemenkes: preset ? preset.nama : null,
        target_inm: preset ? preset.target : null,
        satuan: preset ? preset.satuan : '%',
        aktif: true,
      };
    });

    await prisma.inmIndicatorMapping.createMany({
      data: seedData,
      skipDuplicates: true,
    });

    mappings = await prisma.inmIndicatorMapping.findMany({
      orderBy: { id: 'asc' },
    });
  }

  return mappings;
}

async function updateInmMapping(id, data) {
  return await prisma.inmIndicatorMapping.update({
    where: { id: parseInt(id, 10) },
    data: {
      kode_inm_kemenkes: data.kode_inm_kemenkes,
      nama_inm_kemenkes: data.nama_inm_kemenkes,
      target_inm: data.target_inm ? parseFloat(data.target_inm) : null,
      satuan: data.satuan,
      aktif: data.aktif !== undefined ? Boolean(data.aktif) : true,
    },
  });
}

async function getIntegrationLogs(limit = 50) {
  return await prisma.integrationLog.findMany({
    take: limit,
    orderBy: { created_at: 'desc' },
  });
}

async function createIntegrationLog({ target_system, action, status, payload, response, error_message, created_by }) {
  return await prisma.integrationLog.create({
    data: {
      target_system,
      action,
      status,
      payload: typeof payload === 'object' ? JSON.stringify(payload) : payload,
      response: typeof response === 'object' ? JSON.stringify(response) : response,
      error_message,
      created_by,
    },
  });
}

module.exports = {
  getSettings,
  updateSettings,
  getInmMappings,
  updateInmMapping,
  getIntegrationLogs,
  createIntegrationLog,
};
