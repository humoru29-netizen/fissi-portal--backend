const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const ctrl = require('../controllers/admin.controller');

router.use(authenticate, requireRole('ADMIN'));

router.get('/signups/pending', ctrl.getPendingSignups);
router.patch('/signups/:id', ctrl.decideSignup);

router.get('/students', ctrl.listStudents);
router.post('/students', ctrl.addStudent);
router.post('/students/bulk', ctrl.bulkAddStudents);
router.patch('/students/:id', ctrl.updateStudent);
router.delete('/students/:id', ctrl.deleteStudent);

module.exports = router;
