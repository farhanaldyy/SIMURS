// Modal component
let currentOnConfirm = null;

export function showModal(title, contentHTML, options = {}) {
  const overlay = document.getElementById('modal-overlay');
  const titleEl = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');
  const footer = document.getElementById('modal-footer');

  titleEl.textContent = title;
  body.innerHTML = contentHTML;

  const container = overlay.querySelector('.modal-container');
  if (container) {
    if (options.width) {
      container.style.maxWidth = options.width;
    } else {
      container.style.maxWidth = '';
    }
  }

  // Footer buttons
  let footerHTML = '';
  if (options.onConfirm) {
    currentOnConfirm = options.onConfirm;
    footerHTML = `
      <button class="btn btn-outline" id="modal-cancel-btn">Batal</button>
      <button class="btn btn-primary" id="modal-confirm-btn">${options.confirmText || 'Simpan'}</button>
    `;
  } else {
    footerHTML = `<button class="btn btn-outline" id="modal-cancel-btn">Tutup</button>`;
  }
  footer.innerHTML = footerHTML;

  overlay.classList.remove('hidden');

  // Event listeners
  document.getElementById('modal-close').onclick = closeModal;
  document.getElementById('modal-cancel-btn').onclick = closeModal;

  const confirmBtn = document.getElementById('modal-confirm-btn');
  if (confirmBtn) {
    confirmBtn.onclick = async () => {
      if (currentOnConfirm) {
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Menyimpan...';
        try {
          await currentOnConfirm();
        } finally {
          confirmBtn.disabled = false;
          confirmBtn.textContent = options.confirmText || 'Simpan';
        }
      }
    };
  }

  // Close on overlay click
  overlay.onclick = (e) => {
    if (e.target === overlay) closeModal();
  };

  // Close on Escape
  document.addEventListener('keydown', handleEscape);
}

function handleEscape(e) {
  if (e.key === 'Escape') closeModal();
}

export function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('hidden');
  currentOnConfirm = null;
  document.removeEventListener('keydown', handleEscape);
}
