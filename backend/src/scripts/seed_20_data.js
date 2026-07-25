const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runSeed() {
  console.log('--- START SEEDING 20 RECORDS PER MODULE ---');

  // 1. Ensure Periods for Mei (5), Juni (6), and Juli (7) 2026 exist
  const meiPeriode = await prisma.periode.upsert({
    where: { bulan_tahun: { bulan: 5, tahun: 2026 } },
    update: { status: 'open' },
    create: { bulan: 5, tahun: 2026, status: 'open' }
  });

  const juniPeriode = await prisma.periode.upsert({
    where: { bulan_tahun: { bulan: 6, tahun: 2026 } },
    update: { status: 'open' },
    create: { bulan: 6, tahun: 2026, status: 'open' }
  });

  const juliPeriode = await prisma.periode.upsert({
    where: { bulan_tahun: { bulan: 7, tahun: 2026 } },
    update: { status: 'open' },
    create: { bulan: 7, tahun: 2026, status: 'open' }
  });

  console.log('Periods ensured:', { mei: meiPeriode.id, juni: juniPeriode.id, juli: juliPeriode.id });

  // Get units
  const units = await prisma.unit.findMany();
  if (units.length === 0) {
    throw new Error('No units found in database!');
  }
  const defaultUnitId = units[0].id;
  const rawatInapUnits = units.filter(u => u.kategori_unit === 'rawat_inap').map(u => u.id);
  const unitKhususUnits = units.filter(u => u.kategori_unit === 'unit_khusus').map(u => u.id);
  const igdUnit = units.find(u => u.kategori_unit === 'igd')?.id || defaultUnitId;
  const rawatJalanUnit = units.find(u => u.kategori_unit === 'rawat_jalan')?.id || defaultUnitId;
  const farmasiUnit = units.find(u => u.kategori_unit === 'farmasi')?.id || defaultUnitId;

  // Ensure an admin or default user exists for created_by
  const user = await prisma.user.findFirst();
  const userId = user ? user.id : 1;

  // Array of 20 distinct dates across May, June, July 2026
  // Index 0..6 -> May 2026, Index 7..13 -> June 2026, Index 14..19 -> July 2026
  const sampleDates = [
    // Mei 2026 (7 entries)
    { date: new Date('2026-05-02T08:30:00Z'), dateOnly: new Date('2026-05-02'), periodeId: meiPeriode.id, bulanNama: 'Mei' },
    { date: new Date('2026-05-05T09:15:00Z'), dateOnly: new Date('2026-05-05'), periodeId: meiPeriode.id, bulanNama: 'Mei' },
    { date: new Date('2026-05-09T10:00:00Z'), dateOnly: new Date('2026-05-09'), periodeId: meiPeriode.id, bulanNama: 'Mei' },
    { date: new Date('2026-05-13T11:20:00Z'), dateOnly: new Date('2026-05-13'), periodeId: meiPeriode.id, bulanNama: 'Mei' },
    { date: new Date('2026-05-17T14:10:00Z'), dateOnly: new Date('2026-05-17'), periodeId: meiPeriode.id, bulanNama: 'Mei' },
    { date: new Date('2026-05-21T15:45:00Z'), dateOnly: new Date('2026-05-21'), periodeId: meiPeriode.id, bulanNama: 'Mei' },
    { date: new Date('2026-05-28T16:30:00Z'), dateOnly: new Date('2026-05-28'), periodeId: meiPeriode.id, bulanNama: 'Mei' },

    // Juni 2026 (7 entries)
    { date: new Date('2026-06-01T08:00:00Z'), dateOnly: new Date('2026-06-01'), periodeId: juniPeriode.id, bulanNama: 'Juni' },
    { date: new Date('2026-06-04T09:40:00Z'), dateOnly: new Date('2026-06-04'), periodeId: juniPeriode.id, bulanNama: 'Juni' },
    { date: new Date('2026-06-08T10:15:00Z'), dateOnly: new Date('2026-06-08'), periodeId: juniPeriode.id, bulanNama: 'Juni' },
    { date: new Date('2026-06-12T13:00:00Z'), dateOnly: new Date('2026-06-12'), periodeId: juniPeriode.id, bulanNama: 'Juni' },
    { date: new Date('2026-06-16T14:30:00Z'), dateOnly: new Date('2026-06-16'), periodeId: juniPeriode.id, bulanNama: 'Juni' },
    { date: new Date('2026-06-22T15:10:00Z'), dateOnly: new Date('2026-06-22'), periodeId: juniPeriode.id, bulanNama: 'Juni' },
    { date: new Date('2026-06-27T17:00:00Z'), dateOnly: new Date('2026-06-27'), periodeId: juniPeriode.id, bulanNama: 'Juni' },

    // Juli 2026 (6 entries)
    { date: new Date('2026-07-02T08:45:00Z'), dateOnly: new Date('2026-07-02'), periodeId: juliPeriode.id, bulanNama: 'Juli' },
    { date: new Date('2026-07-06T10:30:00Z'), dateOnly: new Date('2026-07-06'), periodeId: juliPeriode.id, bulanNama: 'Juli' },
    { date: new Date('2026-07-10T11:50:00Z'), dateOnly: new Date('2026-07-10'), periodeId: juliPeriode.id, bulanNama: 'Juli' },
    { date: new Date('2026-07-14T14:00:00Z'), dateOnly: new Date('2026-07-14'), periodeId: juliPeriode.id, bulanNama: 'Juli' },
    { date: new Date('2026-07-19T15:25:00Z'), dateOnly: new Date('2026-07-19'), periodeId: juliPeriode.id, bulanNama: 'Juli' },
    { date: new Date('2026-07-25T16:10:00Z'), dateOnly: new Date('2026-07-25'), periodeId: juliPeriode.id, bulanNama: 'Juli' },
  ];

  const namaPasienList = [
    'Ahmad Subagyo', 'Siti Rahmawati', 'Budi Santoso', 'Dewi Lestari', 'Eko Prasetyo',
    'Fitri Handayani', 'Guruh Trianto', 'Hestin Ningrum', 'Irfan Maulana', 'Joko Widodo',
    'Kartika Sari', 'Lukman Hakim', 'Mega Utami', 'Nugroho Setiawan', 'Oki Pratama',
    'Putri Kusuma', 'Qori Amelia', 'Rahmat Hidayat', 'Suryani Indah', 'Taufik Hidayat'
  ];

  const getUnitForIndex = (i, targetCategory = 'rawat_inap') => {
    if (targetCategory === 'rawat_inap' && rawatInapUnits.length > 0) {
      return rawatInapUnits[i % rawatInapUnits.length];
    }
    if (targetCategory === 'unit_khusus' && unitKhususUnits.length > 0) {
      return unitKhususUnits[i % unitKhususUnits.length];
    }
    if (targetCategory === 'igd') return igdUnit;
    if (targetCategory === 'rawat_jalan') return rawatJalanUnit;
    if (targetCategory === 'farmasi') return farmasiUnit;
    return units[i % units.length].id;
  };

  // -------------------------------------------------------------
  // 1. RisikoJatuh
  // -------------------------------------------------------------
  console.log('Seeding RisikoJatuh...');
  for (let i = 0; i < 20; i++) {
    const s = sampleDates[i];
    await prisma.risikoJatuh.create({
      data: {
        periode_id: s.periodeId,
        unit_id: getUnitForIndex(i, 'rawat_inap'),
        nama_pasien: namaPasienList[i],
        usia: 20 + (i * 3) % 50,
        no_rm: `RM${1000 + i}`,
        asesmen_awal: 'dilakukan',
        asesmen_ulang: 'dilakukan',
        intervensi: 'dilakukan',
        edukasi: 'dilakukan',
        created_by: userId,
        created_at: s.date
      }
    });
  }

  // -------------------------------------------------------------
  // 2. InsidenKeselamatan
  // -------------------------------------------------------------
  console.log('Seeding InsidenKeselamatan...');
  const jenisInsidenList = ['KNC', 'KPC', 'KTC', 'KTD', 'KNC'];
  for (let i = 0; i < 20; i++) {
    const s = sampleDates[i];
    await prisma.insidenKeselamatan.create({
      data: {
        periode_id: s.periodeId,
        unit_id: getUnitForIndex(i, 'rawat_inap'),
        tanggal_kejadian: s.dateOnly,
        jam_kejadian: s.date,
        nama_pasien: namaPasienList[i],
        no_rm: `RM${1000 + i}`,
        deskripsi_insiden: `Insiden observasi keselamatan pasien #${i + 1}`,
        jenis_insiden: jenisInsidenList[i % jenisInsidenList.length],
        created_by: userId,
        created_at: s.date
      }
    });
  }

  // -------------------------------------------------------------
  // 3. ReaksiTransfusi
  // -------------------------------------------------------------
  console.log('Seeding ReaksiTransfusi...');
  for (let i = 0; i < 20; i++) {
    const s = sampleDates[i];
    await prisma.reaksiTransfusi.create({
      data: {
        periode_id: s.periodeId,
        unit_id: getUnitForIndex(i, 'rawat_inap'),
        nama_pasien: namaPasienList[i],
        no_rm: `RM${1000 + i}`,
        ada_reaksi: i === 5, // 1 reaction, 19 no reaction
        jumlah_permintaan_kolf: 2,
        darah_masuk_kolf: 2,
        keterangan: i === 5 ? 'Gatal ringan pada area kulit' : 'Transfusi lancar tanpa komplikasi',
        created_by: userId,
        created_at: s.date
      }
    });
  }

  // -------------------------------------------------------------
  // 4. AngkaKematian
  // -------------------------------------------------------------
  console.log('Seeding AngkaKematian...');
  for (let i = 0; i < 20; i++) {
    const s = sampleDates[i];
    await prisma.angkaKematian.create({
      data: {
        periode_id: s.periodeId,
        unit_id: getUnitForIndex(i, 'rawat_inap'),
        lokasi: 'ranap',
        nama_pasien: namaPasienList[i],
        no_rm: `RM${1000 + i}`,
        tanggal_masuk: s.dateOnly,
        jam_masuk: s.date,
        tanggal_keluar: s.dateOnly,
        jam_keluar: s.date,
        keterangan: 'Observasi pemantauan rawat inap',
        created_by: userId,
        created_at: s.date
      }
    });
  }

  // -------------------------------------------------------------
  // 5. DoubleCheckHighAlert
  // -------------------------------------------------------------
  console.log('Seeding DoubleCheckHighAlert...');
  const obatHighAlert = ['Insulin 100 IU', 'KCl 7.46%', 'Heparin Sodium 5000 IU', 'Fentanyl 50mcg'];
  for (let i = 0; i < 20; i++) {
    const s = sampleDates[i];
    await prisma.doubleCheckHighAlert.create({
      data: {
        periode_id: s.periodeId,
        unit_id: getUnitForIndex(i, 'rawat_inap'),
        nama_pasien: namaPasienList[i],
        no_rm: `RM${1000 + i}`,
        diagnosis: 'Diabetes Mellitus / Hypertensive Crisis',
        nama_obat: obatHighAlert[i % obatHighAlert.length],
        nama_penyerah: 'Perawat Siti',
        nama_penerima: 'Perawat Ani',
        keterangan: 'Verifikasi double check 7 benar',
        created_by: userId,
        created_at: s.date
      }
    });
  }

  // -------------------------------------------------------------
  // 6. WaktuTanggapSc
  // -------------------------------------------------------------
  console.log('Seeding WaktuTanggapSc...');
  for (let i = 0; i < 20; i++) {
    const s = sampleDates[i];
    await prisma.waktuTanggapSc.create({
      data: {
        periode_id: s.periodeId,
        unit_id: getUnitForIndex(i, 'unit_khusus'),
        nama_pasien: namaPasienList[i],
        no_rm: `RM${1000 + i}`,
        diagnosis: 'G2P1A0 Cito SC et causa Gawat Janin',
        jam_ditentukan_operasi: s.date,
        jam_sayatan_pertama: new Date(s.date.getTime() + 25 * 60000), // +25 mins
        selisih_menit: 25,
        created_by: userId,
        created_at: s.date
      }
    });
  }

  // -------------------------------------------------------------
  // 7. IdentifikasiPasien
  // -------------------------------------------------------------
  console.log('Seeding IdentifikasiPasien...');
  for (let i = 0; i < 20; i++) {
    const s = sampleDates[i];
    await prisma.identifikasiPasien.create({
      data: {
        periode_id: s.periodeId,
        unit_id: getUnitForIndex(i, 'rawat_inap'),
        tanggal: s.dateOnly,
        nama_pasien: namaPasienList[i],
        no_rm: `RM${1000 + i}`,
        pemberian_obat: 'dilakukan',
        nutrisi_ngt: 'dilakukan',
        pemberian_darah: 'dilakukan',
        tindakan_keperawatan: 'dilakukan',
        created_by: userId,
        created_at: s.date
      }
    });
  }

  // -------------------------------------------------------------
  // 8. AlurKlinis
  // -------------------------------------------------------------
  console.log('Seeding AlurKlinis...');
  const diagnosaList = ['DHF', 'Typhoid Fever', 'Appendicitis Acute', 'Pneumonia', 'SC'];
  for (let i = 0; i < 20; i++) {
    const s = sampleDates[i];
    await prisma.alurKlinis.create({
      data: {
        periode_id: s.periodeId,
        unit_id: getUnitForIndex(i, 'rawat_inap'),
        nama_pasien: namaPasienList[i],
        no_rm: `RM${1000 + i}`,
        diagnosis: diagnosaList[i % diagnosaList.length],
        ruangan: 'JABAL NUR',
        bulan: s.bulanNama,
        los: 'sesuai',
        penunjang: 'sesuai',
        obat: 'sesuai',
        created_by: userId,
        created_at: s.date
      }
    });
  }

  // -------------------------------------------------------------
  // 9. VisitDokter
  // -------------------------------------------------------------
  console.log('Seeding VisitDokter...');
  const dokterList = ['dr. Ahmad, Sp.PD', 'dr. Budi, Sp.B', 'dr. Siti, Sp.A', 'dr. Dewi, Sp.OG'];
  for (let i = 0; i < 20; i++) {
    const s = sampleDates[i];
    await prisma.visitDokter.create({
      data: {
        periode_id: s.periodeId,
        unit_id: getUnitForIndex(i, 'rawat_inap'),
        nama_dpjp: dokterList[i % dokterList.length],
        nama_pasien: namaPasienList[i],
        no_rm: `RM${1000 + i}`,
        jam_mulai_selesai: '08:00 - 10:00',
        jam_visit: s.date,
        kategori_visit: 'tepat_waktu',
        created_by: userId,
        created_at: s.date
      }
    });
  }

  // -------------------------------------------------------------
  // 10. EmergencyResponseTime
  // -------------------------------------------------------------
  console.log('Seeding EmergencyResponseTime...');
  const triaseList = ['Merah', 'Kuning', 'Hijau'];
  for (let i = 0; i < 20; i++) {
    const s = sampleDates[i];
    await prisma.emergencyResponseTime.create({
      data: {
        periode_id: s.periodeId,
        unit_id: igdUnit,
        nama_pasien: namaPasienList[i],
        no_rm: `RM${1000 + i}`,
        jam_datang: s.date,
        jam_dilayani_dokter: new Date(s.date.getTime() + 4 * 60000), // 4 mins
        respon_time_menit: 4.00,
        triase: triaseList[i % triaseList.length],
        created_by: userId,
        created_at: s.date
      }
    });
  }

  // -------------------------------------------------------------
  // 11. AsesmenAwalIgd
  // -------------------------------------------------------------
  console.log('Seeding AsesmenAwalIgd...');
  for (let i = 0; i < 20; i++) {
    const s = sampleDates[i];
    await prisma.asesmenAwalIgd.create({
      data: {
        periode_id: s.periodeId,
        unit_id: igdUnit,
        nama_pasien: namaPasienList[i],
        no_rm: `RM${1000 + i}`,
        anamnesis: 'ada',
        ttv: 'ada',
        tb: 'ada',
        bb: 'ada',
        diagnosis: 'ada',
        terapi: 'ada',
        created_by: userId,
        created_at: s.date
      }
    });
  }

  // -------------------------------------------------------------
  // 12. PasienTertahanIgd
  // -------------------------------------------------------------
  console.log('Seeding PasienTertahanIgd...');
  for (let i = 0; i < 20; i++) {
    const s = sampleDates[i];
    await prisma.pasienTertahanIgd.create({
      data: {
        periode_id: s.periodeId,
        unit_id: igdUnit,
        nama_pasien: namaPasienList[i],
        no_rm: `RM${1000 + i}`,
        jam_masuk: s.date,
        jam_pindah_ruangan: new Date(s.date.getTime() + 90 * 60000), // 90 mins
        waktu_tunggu_menit: 90,
        keterangan: 'Tunggu konfirmasi bed rawat inap',
        created_by: userId,
        created_at: s.date
      }
    });
  }

  // -------------------------------------------------------------
  // 13. GelangIdentitas
  // -------------------------------------------------------------
  console.log('Seeding GelangIdentitas...');
  for (let i = 0; i < 20; i++) {
    const s = sampleDates[i];
    await prisma.gelangIdentitas.create({
      data: {
        periode_id: s.periodeId,
        unit_id: getUnitForIndex(i, 'rawat_inap'),
        nama_pasien: namaPasienList[i],
        no_rm: `RM${1000 + i}`,
        gelang_identitas: 'dilakukan',
        alergi: 'dilakukan',
        fall_risk: 'dilakukan',
        dnr: 'dilakukan',
        keterangan: 'Gelang terpasang lengkap',
        created_by: userId,
        created_at: s.date
      }
    });
  }

  // -------------------------------------------------------------
  // 14. SerahTerimaPasien
  // -------------------------------------------------------------
  console.log('Seeding SerahTerimaPasien...');
  for (let i = 0; i < 20; i++) {
    const s = sampleDates[i];
    await prisma.serahTerimaPasien.create({
      data: {
        periode_id: s.periodeId,
        unit_id: getUnitForIndex(i, 'rawat_inap'),
        nama_pasien: namaPasienList[i],
        no_rm: `RM${1000 + i}`,
        akun: 'Sesuai',
        keluhan: 'Sesuai',
        ttv: 'Sesuai',
        penunjang: 'Sesuai',
        konsul: 'Sesuai',
        tindakan: 'Sesuai',
        obat: 'Sesuai',
        keterangan: 'Handover SBAR via sistem lengkap',
        created_by: userId,
        created_at: s.date
      }
    });
  }

  // -------------------------------------------------------------
  // 15. KembaliIcu
  // -------------------------------------------------------------
  console.log('Seeding KembaliIcu...');
  for (let i = 0; i < 20; i++) {
    const s = sampleDates[i];
    await prisma.kembaliIcu.create({
      data: {
        periode_id: s.periodeId,
        nama_pasien: namaPasienList[i],
        no_rm: `RM${1000 + i}`,
        diagnosis: 'Post Laparotomy Observation',
        dpjp: 'dr. Budi, Sp.B',
        keterangan: 'Pemantauan stabilisasi pasca perawatan ICU',
        created_by: userId,
        created_at: s.date
      }
    });
  }

  // -------------------------------------------------------------
  // 16. KetidakpatuhanHd
  // -------------------------------------------------------------
  console.log('Seeding KetidakpatuhanHd...');
  for (let i = 0; i < 20; i++) {
    const s = sampleDates[i];
    await prisma.ketidakpatuhanHd.create({
      data: {
        periode_id: s.periodeId,
        nama_pasien: namaPasienList[i],
        no_rm: `RM${1000 + i}`,
        jadwal_hd_per_minggu: '2x per minggu',
        hari_tidak_datang: 'Selasa',
        alasan: 'Pasien kontrol luar kota',
        created_by: userId,
        created_at: s.date
      }
    });
  }

  // -------------------------------------------------------------
  // 17. InsidenClotting
  // -------------------------------------------------------------
  console.log('Seeding InsidenClotting...');
  for (let i = 0; i < 20; i++) {
    const s = sampleDates[i];
    await prisma.insidenClotting.create({
      data: {
        periode_id: s.periodeId,
        tanggal_kejadian: s.dateOnly,
        nama_pasien: namaPasienList[i],
        no_rm: `RM${1000 + i}`,
        deskripsi_insiden: 'Observasi insiden clotting',
        pemberian_antiplatelet: 'Aspirin 80mg',
        created_by: userId,
        created_at: s.date
      }
    });
  }

  // -------------------------------------------------------------
  // 18. InsidenJarumVena
  // -------------------------------------------------------------
  console.log('Seeding InsidenJarumVena...');
  for (let i = 0; i < 20; i++) {
    const s = sampleDates[i];
    await prisma.insidenJarumVena.create({
      data: {
        periode_id: s.periodeId,
        tanggal_kejadian: s.dateOnly,
        nama_pasien: namaPasienList[i],
        no_rm: `RM${1000 + i}`,
        perawat_pemasang: 'Perawat Budi',
        penyebab: 'Gerakan spontan pasien',
        created_by: userId,
        created_at: s.date
      }
    });
  }

  // -------------------------------------------------------------
  // 19. KepatuhanKebersihanTangan
  // -------------------------------------------------------------
  console.log('Seeding KepatuhanKebersihanTangan...');
  const profesiEnumList = ['dokter', 'perawat', 'bidan'];
  const tindakanHhEnum = ['hr', 'hw'];
  for (let i = 0; i < 20; i++) {
    const s = sampleDates[i];
    await prisma.kepatuhanKebersihanTangan.create({
      data: {
        periode_id: s.periodeId,
        unit_id: getUnitForIndex(i, 'rawat_inap'),
        tanggal: s.dateOnly,
        profesi: profesiEnumList[i % profesiEnumList.length],
        momen_1: true,
        momen_2: true,
        momen_3: true,
        momen_4: true,
        momen_5: true,
        tindakan: tindakanHhEnum[i % tindakanHhEnum.length],
        gloves: i % 2 === 0,
        created_by: userId,
        created_at: s.date
      }
    });
  }

  // -------------------------------------------------------------
  // 20. KepatuhanApd
  // -------------------------------------------------------------
  console.log('Seeding KepatuhanApd...');
  for (let i = 0; i < 20; i++) {
    const s = sampleDates[i];
    await prisma.kepatuhanApd.create({
      data: {
        periode_id: s.periodeId,
        unit_id: getUnitForIndex(i, 'rawat_inap'),
        tanggal: s.dateOnly,
        nama_pasien: namaPasienList[i],
        tindakan: 'Pemeriksaan Fisik Pasien',
        profesi: 'Perawat',
        penutup_kepala: true,
        face_shield: true,
        masker: true,
        apron: true,
        coverall: true,
        sarung_tangan: true,
        cover_shoes: true,
        created_by: userId,
        created_at: s.date
      }
    });
  }

  // -------------------------------------------------------------
  // 21. GiziWaktuMakanan
  // -------------------------------------------------------------
  console.log('Seeding GiziWaktuMakanan...');
  for (let i = 0; i < 20; i++) {
    const s = sampleDates[i];
    await prisma.giziWaktuMakanan.create({
      data: {
        periode_id: s.periodeId,
        unit_id: getUnitForIndex(i, 'rawat_inap'),
        tanggal: s.dateOnly,
        jumlah_tepat_waktu: 48 + (i % 3),
        jumlah_porsi: 50,
        persentase: Math.round(((48 + (i % 3)) / 50) * 100),
        created_by: userId,
        created_at: s.date
      }
    });
  }

  // -------------------------------------------------------------
  // 22. GiziSisaMakanan
  // -------------------------------------------------------------
  console.log('Seeding GiziSisaMakanan...');
  for (let i = 0; i < 20; i++) {
    const s = sampleDates[i];
    await prisma.giziSisaMakanan.create({
      data: {
        periode_id: s.periodeId,
        unit_id: getUnitForIndex(i, 'rawat_inap'),
        tanggal: s.dateOnly,
        jumlah_sisa: 3,
        jumlah_porsi: 50,
        persentase: Math.round((3 / 50) * 100),
        created_by: userId,
        created_at: s.date
      }
    });
  }

  // -------------------------------------------------------------
  // 23. GiziKesalahanDiet
  // -------------------------------------------------------------
  console.log('Seeding GiziKesalahanDiet...');
  for (let i = 0; i < 20; i++) {
    const s = sampleDates[i];
    await prisma.giziKesalahanDiet.create({
      data: {
        periode_id: s.periodeId,
        unit_id: getUnitForIndex(i, 'rawat_inap'),
        tanggal: s.dateOnly,
        jumlah_tidak_salah: 50,
        jumlah_porsi: 50,
        persentase: 100,
        created_by: userId,
        created_at: s.date
      }
    });
  }

  // -------------------------------------------------------------
  // 24. GiziIdentifikasiPasien
  // -------------------------------------------------------------
  console.log('Seeding GiziIdentifikasiPasien...');
  for (let i = 0; i < 20; i++) {
    const s = sampleDates[i];
    await prisma.giziIdentifikasiPasien.create({
      data: {
        periode_id: s.periodeId,
        unit_id: getUnitForIndex(i, 'rawat_inap'),
        tanggal: s.dateOnly,
        jumlah_sesuai: 50,
        jumlah_pasien_ranap: 50,
        persentase: 100,
        created_by: userId,
        created_at: s.date
      }
    });
  }

  console.log('=== SUCCESS! 20 RECORDS PER MODULE HAVE BEEN INSERTED INTO DATABASE ===');
}

runSeed()
  .catch(e => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
