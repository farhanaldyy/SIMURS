const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up existing data...');
  
  // Delete all indicators
  await prisma.risikoJatuh.deleteMany();
  await prisma.insidenKeselamatan.deleteMany();
  await prisma.reaksiTransfusi.deleteMany();
  await prisma.angkaKematian.deleteMany();
  await prisma.doubleCheckHighAlert.deleteMany();
  await prisma.waktuTanggapSc.deleteMany();
  await prisma.identifikasiPasien.deleteMany();
  await prisma.alurKlinis.deleteMany();
  await prisma.visitDokter.deleteMany();
  await prisma.emergencyResponseTime.deleteMany();
  await prisma.asesmenAwalIgd.deleteMany();
  await prisma.pasienTertahanIgd.deleteMany();
  await prisma.gelangIdentitas.deleteMany();
  await prisma.serahTerimaPasien.deleteMany();
  await prisma.kembaliIcu.deleteMany();
  await prisma.ketidakpatuhanHd.deleteMany();
  await prisma.periodeHdSummary.deleteMany();
  await prisma.insidenClotting.deleteMany();
  await prisma.insidenJarumVena.deleteMany();
  await prisma.periodeJarumVenaSummary.deleteMany();
  await prisma.penundaanOperasi.deleteMany();
  await prisma.informedConsent.deleteMany();
  await prisma.asesmenPraOperasi.deleteMany();
  await prisma.surgicalChecklist.deleteMany();
  await prisma.penandaanLokasiOperasi.deleteMany();

  // Delete users and units
  await prisma.user.deleteMany();
  await prisma.unit.deleteMany();

  console.log('Seeding new units...');

  const newUnitsData = [
    // Rawat Inap
    { nama_unit: 'JABAL NUR', kode_unit: 'RI_JABAL_NUR' },
    { nama_unit: 'JABAL RAHMAH', kode_unit: 'RI_JABAL_RAHMAH' },
    { nama_unit: 'ASSYIFA', kode_unit: 'RI_ASSYIFA' },
    { nama_unit: 'SHAFA', kode_unit: 'RI_SHAFA' },
    { nama_unit: 'HADIMUALIM & SINTAS', kode_unit: 'RI_HADIMUALIM' },
    { nama_unit: 'SINGAPERBANGSA', kode_unit: 'RI_SINGAPERBANGSA' },

    // Kebidanan
    { nama_unit: 'ANNISA', kode_unit: 'KB_ANNISA' },
    { nama_unit: 'PERINATOLOGI', kode_unit: 'KB_PERINATOLOGI' },

    // Rawat Inap Khusus
    { nama_unit: 'ICU', kode_unit: 'RK_ICU' },
    { nama_unit: 'NICU', kode_unit: 'RK_NICU' },

    // Rawat Jalan
    { nama_unit: 'POLI KLINIK', kode_unit: 'RJ_POLIKLINIK' },

    // Other Units
    { nama_unit: 'UGD (UNIT GAWAT DARURAT)', kode_unit: 'UGD' },
    { nama_unit: 'KAMAR OPERASI / BEDAH', kode_unit: 'OK' },
    { nama_unit: 'HEMODIALISA', kode_unit: 'HD' },
    { nama_unit: 'FARMASI', kode_unit: 'FAR' },
    { nama_unit: 'LABORATORIUM', kode_unit: 'LAB' },
    { nama_unit: 'RADIOLOGI', kode_unit: 'RAD' },
    { nama_unit: 'GIZI', kode_unit: 'GIZI' },
    { nama_unit: 'REKAM MEDIS', kode_unit: 'RM' },
    { nama_unit: 'REHAB MEDIS', kode_unit: 'REHAB' },
    { nama_unit: 'LAUNDRY', kode_unit: 'LAUNDRY' },
    { nama_unit: 'IPSRS', kode_unit: 'IPSRS' },
    { nama_unit: 'SIMRS', kode_unit: 'SIMRS' },
    { nama_unit: 'PENDAFTARAN', kode_unit: 'PENDAFTARAN' }
  ];

  const units = [];
  for (const u of newUnitsData) {
    const created = await prisma.unit.create({ data: u });
    units.push(created);
  }

  console.log(`Created ${units.length} units`);

  // Default password hashes
  const adminHash = await bcrypt.hash('admin123', 12);
  const komiteHash = await bcrypt.hash('komite123', 12);
  const picHash = await bcrypt.hash('pic123', 12);
  const petugasHash = await bcrypt.hash('petugas123', 12);

  // Admin user
  await prisma.user.create({
    data: {
      nama: 'Administrator',
      username: 'admin',
      password_hash: adminHash,
      role: 'admin',
      unit_id: null,
    },
  });
  console.log('Created admin user');

  // Komite Mutu user
  await prisma.user.create({
    data: {
      nama: 'Komite Mutu',
      username: 'komite',
      password_hash: komiteHash,
      role: 'komite',
      unit_id: null,
    },
  });
  console.log('Created komite user');

  // PIC Ranap (link to JABAL NUR)
  const jabalNurUnit = units.find(u => u.kode_unit === 'RI_JABAL_NUR');
  await prisma.user.create({
    data: {
      nama: 'PIC Jabal Nur',
      username: 'pic_ranap',
      password_hash: picHash,
      role: 'pic_mutu',
      unit_id: jabalNurUnit ? jabalNurUnit.id : null,
    },
  });
  console.log('Created pic_ranap user');

  // Petugas UGD (link to UGD)
  const ugdUnit = units.find(u => u.kode_unit === 'UGD');
  await prisma.user.create({
    data: {
      nama: 'Petugas UGD',
      username: 'petugas_igd',
      password_hash: petugasHash,
      role: 'petugas',
      unit_id: ugdUnit ? ugdUnit.id : null,
    },
  });
  console.log('Created petugas_igd user');

  // Create active periods (Juni and Juli 2026)
  await prisma.periode.upsert({
    where: { bulan_tahun: { bulan: 6, tahun: 2026 } },
    update: {},
    create: { bulan: 6, tahun: 2026, status: 'open' },
  });
  
  await prisma.periode.upsert({
    where: { bulan_tahun: { bulan: 7, tahun: 2026 } },
    update: {},
    create: { bulan: 7, tahun: 2026, status: 'open' },
  });
  
  console.log('Created periods for June and July 2026');
  console.log('Seeding complete!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
