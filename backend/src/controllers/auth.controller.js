const authService = require('../services/auth.service');

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, data: { accessToken: result.accessToken, user: result.user } });
  } catch (err) {
    next(err);
  }
}

async function refreshToken(req, res, next) {
  try {
    const token = req.cookies.refreshToken;
    const result = await authService.refreshAccessToken(token);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res) {
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logout berhasil' });
}

async function getMe(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, refreshToken, logout, getMe };
