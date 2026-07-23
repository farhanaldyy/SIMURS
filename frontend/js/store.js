// SIMURS Store — Global State Management
const Store = {
  user: null,
  periodeAktif: null,
  unitAktif: null,
  token: null,
  periodeList: [],
  unitList: [],
  indicatorSummariesCache: null,

  clearSummaryCache() {
    this.indicatorSummariesCache = null;
  },

  set(key, value) {
    this[key] = value;
    if (key === 'periodeAktif' || key === 'unitAktif') {
      this.clearSummaryCache();
    }
    if (key === 'token') {
      if (value) sessionStorage.setItem('simurs_token', value);
      else sessionStorage.removeItem('simurs_token');
    }
    if (key === 'user') {
      if (value) sessionStorage.setItem('simurs_user', JSON.stringify(value));
      else sessionStorage.removeItem('simurs_user');
    }
    if (key === 'periodeAktif') {
      if (value) sessionStorage.setItem('simurs_periode', JSON.stringify(value));
      else sessionStorage.removeItem('simurs_periode');
    }
    if (key === 'unitAktif') {
      if (value) sessionStorage.setItem('simurs_unit', JSON.stringify(value));
      else sessionStorage.removeItem('simurs_unit');
    }
  },

  get(key) {
    return this[key];
  },

  loadFromStorage() {
    // Clear legacy persistent localStorage items to ensure session-only authentication
    localStorage.removeItem('simurs_token');
    localStorage.removeItem('simurs_user');
    localStorage.removeItem('simurs_periode');
    localStorage.removeItem('simurs_unit');

    this.token = sessionStorage.getItem('simurs_token') || null;
    try {
      this.user = JSON.parse(sessionStorage.getItem('simurs_user')) || null;
      this.periodeAktif = JSON.parse(sessionStorage.getItem('simurs_periode')) || null;
      this.unitAktif = JSON.parse(sessionStorage.getItem('simurs_unit')) || null;
    } catch { /* ignore parse errors */ }

    // Enforce unitAktif for petugas role synchronously on load
    if (this.user && this.user.role === 'petugas' && (this.user.unit || this.user.unit_id)) {
      if (!this.unitAktif || (this.user.unit_id && this.unitAktif.id !== this.user.unit_id)) {
        this.unitAktif = this.user.unit || { id: this.user.unit_id };
        sessionStorage.setItem('simurs_unit', JSON.stringify(this.unitAktif));
      }
    }
  },

  clear() {
    this.user = null;
    this.token = null;
    this.periodeAktif = null;
    this.unitAktif = null;
    this.periodeList = [];
    this.unitList = [];
    sessionStorage.removeItem('simurs_token');
    sessionStorage.removeItem('simurs_user');
    sessionStorage.removeItem('simurs_periode');
    sessionStorage.removeItem('simurs_unit');
    localStorage.removeItem('simurs_token');
    localStorage.removeItem('simurs_user');
    localStorage.removeItem('simurs_periode');
    localStorage.removeItem('simurs_unit');
  },

  isAuthenticated() {
    return !!this.token;
  },

  isAdmin() {
    return this.user && this.user.role === 'admin';
  },

  canDelete() {
    return this.user && ['admin', 'pic_mutu', 'petugas'].includes(this.user.role);
  },

  canExport() {
    return this.user && ['admin', 'pic_mutu', 'komite'].includes(this.user.role);
  }
};

export default Store;
