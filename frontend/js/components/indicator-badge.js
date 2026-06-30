// Indicator badge component
export function renderBadge(nilai, threshold, tipe = 'persen') {
  let status, cssClass, icon;
  const numVal = parseFloat(nilai);
  const numThreshold = parseFloat(threshold);

  if (isNaN(numVal) || isNaN(numThreshold)) {
    return `<span class="badge badge-info">N/A</span>`;
  }

  // For "lower is better" indicators (e.g., insiden, kematian)
  if (tipe === 'inverse') {
    if (numVal <= numThreshold) { status = 'Baik'; cssClass = 'badge-success'; icon = '✓'; }
    else if (numVal <= numThreshold * 1.3) { status = 'Perhatian'; cssClass = 'badge-warning'; icon = '⚠'; }
    else { status = 'Kritis'; cssClass = 'badge-danger'; icon = '✕'; }
  } else {
    // Standard: higher is better
    if (numVal >= numThreshold) { status = 'Tercapai'; cssClass = 'badge-success'; icon = '✓'; }
    else if (numVal >= numThreshold * 0.7) { status = 'Perhatian'; cssClass = 'badge-warning'; icon = '⚠'; }
    else { status = 'Tidak Tercapai'; cssClass = 'badge-danger'; icon = '✕'; }
  }

  return `<span class="badge ${cssClass}">${icon} ${status}</span>`;
}
