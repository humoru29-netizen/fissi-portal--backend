const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const ctrl = require('../controllers/fees.controller');

router.use(authenticate, requireRole('CASHIER', 'ADMIN'));

router.post('/', ctrl.recordFee);
router.get('/:studentId', ctrl.getStudentFees);
router.post('/bulk-csv', ctrl.bulkUploadFees);
router.post('/adjustments', ctrl.addAdjustment);

module.exports = router;
