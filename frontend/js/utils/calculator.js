// Indicator calculation utilities
export function hitungNilaiN(record, fields, criteria = 'dilakukan') {
  return fields.every(f => record[f] === criteria) ? 1 : 0;
}

export function hitungNumerator(data, conditionFn) {
  return data.filter(conditionFn).length;
}

export function hitungIndikator(numerator, denominator) {
  if (!denominator || denominator === 0) return 0;
  return ((numerator / denominator) * 100).toFixed(2);
}
