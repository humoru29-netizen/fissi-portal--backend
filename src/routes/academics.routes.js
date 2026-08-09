const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const ctrl = require('../controllers/academics.controller');

router.get('/classes', authenticate, ctrl.listClasses);
router.post('/classes', authenticate, requireRole('ADMIN'), ctrl.addClass);

router.get('/subjects', authenticate, ctrl.listSubjects);
router.post('/subjects', authenticate, requireRole('ADMIN'), ctrl.addSubject);

module.exports = router;
