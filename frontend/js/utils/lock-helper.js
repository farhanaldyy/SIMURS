import Store from '../store.js';
import { showToast } from '../components/toast.js';

let observer = null;
let debounceTimeout = null;

/**
 * Check if the currently active period is locked (status === 'closed')
 * @returns {boolean}
 */
export function isCurrentPeriodLocked() {
  const activePeriode = Store.periodeAktif;
  return activePeriode ? activePeriode.status === 'closed' : false;
}

/**
 * Renders a prominent lock warning banner inside a target container,
 * ensuring EXACTLY ONE banner exists across the entire DOM.
 * @param {HTMLElement} container 
 */
export function renderLockBanner(container) {
  const isLocked = isCurrentPeriodLocked();
  const isAdminPeriodePage = window.location.hash === '#/admin/periode';
  const existingBanners = document.querySelectorAll('#period-lock-banner');

  if (!isLocked || isAdminPeriodePage) {
    existingBanners.forEach(b => b.remove());
    return;
  }

  const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const activeP = Store.periodeAktif;
  const periodLabel = activeP ? `${monthNames[activeP.bulan]} ${activeP.tahun}` : '';

  // Clean up any extra duplicate banners, keeping at most one
  if (existingBanners.length > 1) {
    for (let i = 1; i < existingBanners.length; i++) {
      existingBanners[i].remove();
    }
  }

  let banner = existingBanners[0];
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'period-lock-banner';
    banner.style.cssText = `
      margin-bottom: 20px;
      padding: 14px 18px;
      background: rgba(239, 68, 68, 0.08);
      border-left: 5px solid var(--color-danger, #ef4444);
      border-radius: var(--radius-md, 8px);
      display: flex;
      align-items: center;
      justify-content: space-between;
    `;
    
    // Target insertion point: preferably top of .module-page
    const target = (container && container.querySelector('.module-page')) || container || document.getElementById('main-content');
    if (target) {
      const firstChild = target.firstElementChild;
      if (firstChild) {
        target.insertBefore(banner, firstChild);
      } else {
        target.appendChild(banner);
      }
    }
  }

  // Update innerHTML
  banner.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <span style="font-size: 1.5rem;">🔒</span>
      <div>
        <strong style="color: var(--color-danger, #ef4444); font-size: 0.95rem;">Periode ${periodLabel} Terkunci (Closed)</strong>
        <p style="margin: 2px 0 0 0; font-size: 0.85rem; color: var(--color-text-secondary, #64748b);">
          Seluruh data pada periode ini bersifat <strong>Read-Only</strong>. Pengubahan, penambahan, atau penghapusan data telah dikunci demi integritas laporan.
        </p>
      </div>
    </div>
  `;
}

/**
 * Enforces Read-Only UI state when the active period is closed across all modules
 * @param {HTMLElement} container 
 */
export function applyPeriodLockUI(container) {
  const targetContainer = container || document.getElementById('main-content');
  if (!targetContainer) return;

  if (window.location.hash === '#/admin/periode') {
    // Admin needs to lock/unlock periods on this page
    const banners = document.querySelectorAll('#period-lock-banner');
    banners.forEach(b => b.remove());
    return;
  }

  renderLockBanner(targetContainer);

  if (isCurrentPeriodLocked()) {
    // 1. Disable all action buttons
    const buttons = targetContainer.querySelectorAll('button, input[type="button"], input[type="submit"]');
    buttons.forEach(btn => {
      // Exclude navigation/logout/toggle/export/download buttons
      const isAllowed = 
        btn.id === 'sidebar-toggle' ||
        btn.id === 'btn-logout' ||
        btn.id === 'btn-download-template-page' ||
        btn.id?.includes('export') ||
        btn.className?.includes('export') ||
        btn.className?.includes('btn-outline') && (btn.textContent?.includes('Export') || btn.textContent?.includes('Unduh') || btn.textContent?.includes('Kembali') || btn.textContent?.includes('Template'));

      if (!isAllowed) {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
        btn.style.pointerEvents = 'none';
        btn.title = 'Tidak dapat diubah karena periode terkunci (Closed)';
      }
    });

    // 2. Disable all form controls (input, select, textarea)
    const inputs = targetContainer.querySelectorAll('input:not([type="hidden"]), select, textarea');
    inputs.forEach(el => {
      const isHeaderSelect = el.id === 'header-periode-select' || el.id === 'header-unit-select' || el.id === 'module-search';
      if (!isHeaderSelect) {
        el.disabled = true;
        el.style.opacity = '0.7';
        el.style.cursor = 'not-allowed';
        el.title = 'Periode terkunci (Closed)';
      }
    });
  }

  // Ensure Observer is running to catch async table re-renders
  initLockObserver();
}

/**
 * MutationObserver to automatically re-enforce lock UI on async DOM changes
 */
function initLockObserver() {
  if (observer) return;
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;

  observer = new MutationObserver(() => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      if (isCurrentPeriodLocked() && window.location.hash !== '#/admin/periode') {
        const buttons = mainContent.querySelectorAll('button:not([disabled]), input[type="submit"]:not([disabled])');
        const inputs = mainContent.querySelectorAll('input:not([disabled]):not([type="hidden"]):not(#header-periode-select):not(#header-unit-select):not(#module-search), select:not([disabled]):not(#header-periode-select):not(#header-unit-select), textarea:not([disabled])');
        
        if (buttons.length > 0 || inputs.length > 0) {
          applyPeriodLockUI(mainContent);
        }
      }
    }, 100);
  });

  observer.observe(mainContent, { childList: true, subtree: true });
}

/**
 * Helper to show toast warning if user attempts an operation on a locked period
 * @returns {boolean} true if locked (and toast shown), false otherwise
 */
export function checkAndNotifyLock() {
  if (isCurrentPeriodLocked()) {
    showToast('Periode ini telah dikunci (Closed). Data tidak dapat ditambah, diubah, atau dihapus.', 'warning');
    return true;
  }
  return false;
}
