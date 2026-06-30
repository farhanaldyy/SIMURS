// Form validation utilities
export function validateRequired(value, fieldLabel) {
  if (!value || String(value).trim() === '') return `${fieldLabel} wajib diisi`;
  return null;
}

export function validateNoRM(value) {
  if (!value) return 'No RM wajib diisi';
  if (!/^[a-zA-Z0-9./\-\s]{5,20}$/.test(value)) return 'No RM harus 5-20 karakter (boleh menggunakan huruf, angka, -, /, ., spasi)';
  return null;
}

export function validateTime(value) {
  if (!value) return 'Waktu wajib diisi';
  if (!/^\d{2}:\d{2}$/.test(value)) return 'Format waktu harus HH:MM';
  return null;
}

export function validateDate(value) {
  if (!value) return 'Tanggal wajib diisi';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Format tanggal harus YYYY-MM-DD';
  return null;
}

export function validateTimeOrder(jamAwal, jamAkhir) {
  if (!jamAwal || !jamAkhir) return null;
  if (jamAkhir <= jamAwal) return 'Jam akhir harus lebih besar dari jam awal';
  return null;
}

export function validatePositiveInt(value, fieldLabel) {
  const num = parseInt(value);
  if (isNaN(num) || num < 0) return `${fieldLabel} harus bilangan bulat positif`;
  return null;
}

export function validateEnum(value, options, fieldLabel) {
  if (!options.includes(value)) return `${fieldLabel} harus salah satu dari: ${options.join(', ')}`;
  return null;
}

export function validateForm(validations) {
  const errors = {};
  for (const [field, errorMsg] of Object.entries(validations)) {
    if (errorMsg) errors[field] = errorMsg;
  }
  return Object.keys(errors).length > 0 ? errors : null;
}

export function showFormErrors(formElement, errors) {
  // Clear previous
  formElement.querySelectorAll('.form-error').forEach(e => e.remove());
  formElement.querySelectorAll('.is-invalid').forEach(e => e.classList.remove('is-invalid'));

  if (!errors) return;
  for (const [field, msg] of Object.entries(errors)) {
    const input = formElement.querySelector(`[name="${field}"]`);
    if (input) {
      input.classList.add('is-invalid');
      const errEl = document.createElement('div');
      errEl.className = 'form-error';
      errEl.textContent = msg;
      input.parentElement.appendChild(errEl);
    }
  }
}
