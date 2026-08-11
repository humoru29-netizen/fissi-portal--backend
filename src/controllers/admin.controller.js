const prisma = require('../config/prisma');

async function getPendingSignups(req, res) {
  const users = await prisma.user.findMany({
    where: { signupStatus: 'PENDING' },
    select: { id: true, fullName: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  res.json({ signups: users });
}

async function decideSignup(req, res) {
  const { id } = req.params;
  const { decision } = req.body;

  if (!['APPROVED', 'REJECTED'].includes(decision)) {
    return res.status(400).json({ error: 'decision must be APPROVED or REJECTED' });
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const updated = await prisma.user.update({
    where: { id },
    data: { signupStatus: decision },
  });

  res.json({
    message: `Signup ${decision.toLowerCase()}`,
    user: { id: updated.id, fullName: updated.fullName, email: updated.email, role: updated.role, signupStatus: updated.signupStatus },
  });
}

async function listStudents(req, res) {
  const { classId } = req.query;
  const students = await prisma.student.findMany({
    where: classId ? { classId } : undefined,
    include: { class: true },
    orderBy: { fullName: 'asc' },
  });
  res.json({ students });
}

async function addStudent(req, res) {
  const { admissionNo, fullName, classId, guardianName, guardianPhone, dateOfBirth, gender, photoUrl } = req.body;

  if (!admissionNo || !fullName || !classId) {
    return res.status(400).json({ error: 'admissionNo, fullName and classId are required' });
  }

  try {
    const student = await prisma.student.create({
      data: { admissionNo, fullName, classId, guardianName, guardianPhone, gender, photoUrl,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined },
    });
    res.status(201).json({ student });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'A student with this admission number already exists' });
    }
    console.error('Add student error:', err);
    res.status(500).json({ error: 'Could not add student' });
  }
}

async function updateStudent(req, res) {
  const { id } = req.params;
  const data = req.body;
  if (data.dateOfBirth) data.dateOfBirth = new Date(data.dateOfBirth);

  try {
    const student = await prisma.student.update({ where: { id }, data });
    res.json({ student });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Student not found' });
    console.error('Update student error:', err);
    res.status(500).json({ error: 'Could not update student' });
  }
}

async function deleteStudent(req, res) {
  const { id } = req.params;
  try {
    await prisma.student.delete({ where: { id } });
    res.json({ message: 'Student deleted' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Student not found' });
    console.error('Delete student error:', err);
    res.status(500).json({ error: 'Could not delete student' });
  }
}

async function bulkAddStudents(req, res) {
  const { students } = req.body;
  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ error: 'students must be a non-empty array' });
  }

  const results = { created: 0, failed: [] };
  for (const s of students) {
    try {
      await prisma.student.create({ data: s });
      results.created++;
    } catch (err) {
      results.failed.push({ admissionNo: s.admissionNo, reason: err.code === 'P2002' ? 'duplicate admissionNo' : 'invalid data' });
    }
  }
  res.json(results);
}

module.exports = {
  getPendingSignups,
  decideSignup,
  listStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  bulkAddStudents,
listUsers,
};
