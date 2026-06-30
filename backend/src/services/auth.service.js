const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

async function login(username, password) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: { unit: true },
  });

  if (!user || !user.aktif) {
    throw Object.assign(new Error('Username atau password salah'), { statusCode: 401 });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw Object.assign(new Error('Username atau password salah'), { statusCode: 401 });
  }

  const payload = { id: user.id, nama: user.nama, role: user.role, unit_id: user.unit_id };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, nama: user.nama, role: user.role, unit_id: user.unit_id, unit: user.unit, allowed_modules: user.allowed_modules },
  };
}

async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    throw Object.assign(new Error('Refresh token tidak ditemukan'), { statusCode: 401 });
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await prisma.user.findUnique({ where: { id: decoded.id }, include: { unit: true } });

  if (!user || !user.aktif) {
    throw Object.assign(new Error('User tidak ditemukan atau tidak aktif'), { statusCode: 401 });
  }

  const payload = { id: user.id, nama: user.nama, role: user.role, unit_id: user.unit_id };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

  return { accessToken, user: { id: user.id, nama: user.nama, role: user.role, unit_id: user.unit_id, unit: user.unit, allowed_modules: user.allowed_modules } };
}

async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { unit: true },
    omit: { password_hash: true },
  });
  if (!user) throw Object.assign(new Error('User tidak ditemukan'), { statusCode: 404 });
  return user;
}

module.exports = { login, refreshAccessToken, getMe };
