const rateLimit = require('express-rate-limit');

// Strict rate limiter for authentication routes (login/refresh token)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak percobaan login. Silakan coba lagi setelah 15 menit.',
  },
});

// General rate limiter for general API routes
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // Limit each IP to 1000 requests per minute (accommodating concurrent clinic staff)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak permintaan API. Silakan lambatkan navigasi Anda.',
  },
});

module.exports = {
  authLimiter,
  apiLimiter,
};
