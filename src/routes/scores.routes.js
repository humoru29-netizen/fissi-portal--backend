const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const ctrl = require('../controllers/scores.controller');

router.post('/', authenticate, requireRole('TEACHER', 'ADMIN'), ctrl.submitScores);

router.get('/pending', authenticate, requireRole('ADMIN'), ctrl.getPendingScores);
router.patch('/:id/decision', authenticate, requireRole('ADMIN'), ctrl.decideScore);

router.patch('/:id', authenticate, requireRole('ADMIN'), ctrl.editScore);
router.delete('/:id', authenticate, requireRole('ADMIN'), ctrl.deleteScore);

module.exports = router;
