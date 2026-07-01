// Indicator badge component
export function renderBadge(nilai, threshold, tipe = 'persen') {
  let status, cssClass, icon;
  const numVal = parseFloat(nilai);

  let numThreshold = parseFloat(threshold);
  let operator = null;
  if (typeof threshold === 'string') {
    const cleanThreshold = threshold.replace(/[^\d.]/g, '');
    numThreshold = parseFloat(cleanThreshold);
    if (threshold.includes('<')) operator = '<';
    else if (threshold.includes('≤')) operator = '≤';
    else if (threshold.includes('≥')) operator = '≥';
    else if (threshold.includes('>')) operator = '>';
  }

  if (isNaN(numVal) || isNaN(numThreshold)) {
    return `<span class="badge badge-info">N/A</span>`;
  }

  // For operator-based standards
  if (operator) {
    let met = false;
    if (operator === '<') met = numVal < numThreshold;
    else if (operator === '≤') met = numVal <= numThreshold;
    else if (operator === '≥') met = numVal >= numThreshold;
    else if (operator === '>') met = numVal > numThreshold;

    if (met) {
      status = 'Tercapai';
      cssClass = 'badge-success';
      icon = '✓';
    } else {
      status = 'Tidak Tercapai';
      cssClass = 'badge-danger';
      icon = '✕';
    }
  } else if (tipe === 'inverse') {
    // For "lower is better" indicators without explicit operators
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
