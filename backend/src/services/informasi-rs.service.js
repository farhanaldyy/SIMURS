const prisma = require('../config/database');

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
  deskripsi: 'Sistem Informasi Mutu Rumah Sakit — Menjaga Mutu dan Keselamatan Pasien'
};

async function getInformasiRS() {
  let info = await prisma.informasiRumahSakit.findFirst();
  if (!info) {
    info = await prisma.informasiRumahSakit.create({
      data: DEFAULT_INFO
    });
  }
  return info;
}

async function updateInformasiRS(data) {
  let info = await prisma.informasiRumahSakit.findFirst();

  const payload = {
    nama_rs: data.nama_rs !== undefined ? data.nama_rs : (info ? info.nama_rs : DEFAULT_INFO.nama_rs),
    kode_rs: data.kode_rs !== undefined ? data.kode_rs : (info ? info.kode_rs : null),
    alamat: data.alamat !== undefined ? data.alamat : (info ? info.alamat : null),
    telepon: data.telepon !== undefined ? data.telepon : (info ? info.telepon : null),
    email: data.email !== undefined ? data.email : (info ? info.email : null),
    website: data.website !== undefined ? data.website : (info ? info.website : null),
    logo_url: data.logo_url !== undefined && data.logo_url !== null && data.logo_url !== '' 
      ? data.logo_url 
      : (info ? info.logo_url : DEFAULT_INFO.logo_url),
    nama_direktur: data.nama_direktur !== undefined ? data.nama_direktur : (info ? info.nama_direktur : null),
    nip_direktur: data.nip_direktur !== undefined ? data.nip_direktur : (info ? info.nip_direktur : null),
    kota: data.kota !== undefined ? data.kota : (info ? info.kota : null),
    deskripsi: data.deskripsi !== undefined ? data.deskripsi : (info ? info.deskripsi : null),
  };

  if (info) {
    return await prisma.informasiRumahSakit.update({
      where: { id: info.id },
      data: payload
    });
  } else {
    return await prisma.informasiRumahSakit.create({
      data: payload
    });
  }
}

module.exports = {
  getInformasiRS,
  updateInformasiRS
};
