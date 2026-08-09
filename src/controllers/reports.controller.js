const prisma = require('../config/prisma');
const { generateReportCardPDF } = require('../utils/pdfGenerator');

async function getReportCard(req, res) {
  const { studentId } = req.params;
  const { term, session } = req.query;

  if (!term || !session) {
    return res.status(400).json({ error: 'term and session query params are required' });
  }

  const student = await prisma.student.findUnique({ where: { id: studentId }, include: { class: true } });
  if (!student) return res.status(404).json({ error: 'Student not found' });

  if (req.user.role === 'STUDENT' && req.user.student?.id !== studentId) {
    return res.status(403).json({ error: 'You may only view your own report card' });
  }

  const scores = await prisma.score.findMany({
    where: { studentId, term, session, status: 'APPROVED' },
    include: { subject: true },
    orderBy: { subject: { name: 'asc' } },
  });

  if (scores.length === 0) {
    return res.status(404).json({ error: 'No approved scores found for this term/session yet. Report card is not ready.' });
  }

  generateReportCardPDF(res, { student, classInfo: student.class, term, session, scores });
}

module.exports = { getReportCard };
