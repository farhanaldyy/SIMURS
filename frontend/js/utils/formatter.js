// Date, time, and number formatting utilities
const BULAN_NAMA = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${d.getDate()} ${BULAN_NAMA[d.getMonth() + 1]} ${d.getFullYear()}`;
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export function formatTime(timeStr) {
  if (!timeStr) return '-';
  if (timeStr instanceof Date) {
    return `${String(timeStr.getUTCHours()).padStart(2, '0')}:${String(timeStr.getUTCMinutes()).padStart(2, '0')}`;
  }
  const str = String(timeStr);
  if (str.includes('T')) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
    }
  }
  return str.substring(0, 5);
}

export function formatPercent(value, decimals = 2) {
  if (value === null || value === undefined) return '-';
  return `${parseFloat(value).toFixed(decimals)}%`;
}

export function hitungSelisihMenit(jam1, jam2) {
  const [h1, m1] = jam1.split(':').map(Number);
  const [h2, m2] = jam2.split(':').map(Number);
  return (h2 * 60 + m2) - (h1 * 60 + m1);
}

export function formatPeriode(periode) {
  if (!periode) return '-';
  return `${BULAN_NAMA[periode.bulan]} ${periode.tahun}`;
}

export function getBulanNama(bulan) {
  return BULAN_NAMA[bulan] || '-';
}
