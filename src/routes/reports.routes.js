const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/reports.controller');

router.get('/:studentId', authenticate, ctrl.getReportCard);

module.exports = router;
