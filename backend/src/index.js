require('dotenv').config();
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const { errorHandler } = require('./middleware/errorHandler');
const routes = require('./routes');

const helmet = require('helmet');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust reverse proxy headers (Docker / Nginx)
app.set('trust proxy', 1);

// Security & Optimization Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for inline SPA scripts/Chart.js CDN compatibility
}));
app.use(compression());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Rate limiting for API auth & global endpoints
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../../frontend')));

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'SIMURS API is running' });
});

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`SIMURS Backend running on port ${PORT}`);
});

module.exports = app;
