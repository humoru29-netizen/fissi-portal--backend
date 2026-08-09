const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const scoresRoutes = require('./routes/scores.routes');
const feesRoutes = require('./routes/fees.routes');
const reportsRoutes = require('./routes/reports.routes');
const academicsRoutes = require('./routes/academics.routes');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '*').split(',').map(o => o.trim());
app.use(cors({
  origin: allowedOrigins.includes('*') ? true : allowedOrigins,
  credentials: true,
}));

app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'FISSI-PORTAL backend is running' });
});
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/scores', scoresRoutes);
app.use('/api/fees', feesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/academics', academicsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
