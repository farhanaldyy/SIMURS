// Login page
import Store from '../store.js';
import { login } from '../api/auth.js';
import { showToast } from '../components/toast.js';

export async function render(container) {
  container.innerHTML = `
    <div class="login-page">
      <div class="login-card">
        <div class="login-logo">
          <img src="assets/img/logo.png" alt="SIMURS">
          <h1>SIMURS</h1>
          <p>Sistem Informasi Mutu Rumah Sakit</p>
        </div>
        <form id="login-form">
          <div class="form-group">
            <label class="form-label" for="username">Username</label>
            <input type="text" id="username" name="username" class="form-control" placeholder="Masukkan username" autocomplete="username" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <div class="password-wrapper" id="password-wrapper">
              <input type="password" id="password" name="password" class="form-control" placeholder="Masukkan password" autocomplete="current-password" required>
              <button type="button" id="toggle-password" class="toggle-password-btn" aria-label="Tampilkan password">
                <svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg class="eye-off-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
          </div>
          <div id="login-error" class="form-error" style="margin-bottom: 12px; display: none;"></div>
          <button type="submit" class="btn btn-primary" id="btn-login">Masuk</button>
        </form>
      </div>
    </div>
  `;

  const toggleBtn = document.getElementById('toggle-password');
  const passwordInput = document.getElementById('password');
  const passwordWrapper = document.getElementById('password-wrapper');

  if (toggleBtn && passwordInput && passwordWrapper) {
    toggleBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      passwordWrapper.classList.toggle('show-password', type === 'text');
      toggleBtn.setAttribute('aria-label', type === 'password' ? 'Tampilkan password' : 'Sembunyikan password');
    });
  }

  document.getElementById('login-form').addEventListener('submit', handleLogin);
}

async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-login');
  const errorEl = document.getElementById('login-error');

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!username || !password) {
    errorEl.textContent = 'Username dan password wajib diisi';
    errorEl.style.display = 'block';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Memproses...';
  errorEl.style.display = 'none';

  const result = await login(username, password);

  if (result.success) {
    Store.set('token', result.data.accessToken);
    Store.set('user', result.data.user);
    showToast(`Selamat datang, ${result.data.user.nama}!`, 'success');
    window.location.hash = '#/dashboard';
    window.dispatchEvent(new Event('userLoggedIn'));
  } else {
    errorEl.textContent = result.message || 'Login gagal';
    errorEl.style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Masuk';
  }
}

export function destroy() {}
