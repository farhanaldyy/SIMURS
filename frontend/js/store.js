// SIMURS Store — Global State Management
const Store = {
  user: null,
  periodeAktif: null,
  unitAktif: null,
  token: null,
  periodeList: [],
  unitList: [],

  set(key, value) {
    this[key] = value;
    if (key === 'token') {
      if (value) localStorage.setItem('simurs_token', value);
      else localStorage.removeItem('simurs_token');
    }
    if (key === 'user' && value) {
      localStorage.setItem('simurs_user', JSON.stringify(value));
    }
    if (key === 'periodeAktif' && value) {
      localStorage.setItem('simurs_periode', JSON.stringify(value));
    }
    if (key === 'unitAktif' && value) {
      localStorage.setItem('simurs_unit', JSON.stringify(value));
    }
  },

  get(key) {
    return this[key];
  },

  loadFromStorage() {
    this.token = localStorage.getItem('simurs_token') || null;
    try {
      this.user = JSON.parse(localStorage.getItem('simurs_user')) || null;
      this.periodeAktif = JSON.parse(localStorage.getItem('simurs_periode')) || null;
      this.unitAktif = JSON.parse(localStorage.getItem('simurs_unit')) || null;
    } catch { /* ignore parse errors */ }
  },

  clear() {
    this.user = null;
    this.token = null;
    this.periodeAktif = null;
    this.unitAktif = null;
    this.periodeList = [];
    this.unitList = [];
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
    return this.user && ['admin', 'pic_mutu'].includes(this.user.role);
  },

  canExport() {
    return this.user && ['admin', 'pic_mutu', 'komite'].includes(this.user.role);
  }
};

export default Store;
