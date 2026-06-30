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
            <input type="password" id="password" name="password" class="form-control" placeholder="Masukkan password" autocomplete="current-password" required>
          </div>
          <div id="login-error" class="form-error" style="margin-bottom: 12px; display: none;"></div>
          <button type="submit" class="btn btn-primary" id="btn-login">Masuk</button>
        </form>
      </div>
    </div>
  `;

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
