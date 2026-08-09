const prisma = require('../config/prisma');
const { computeTotal, computeGrade } = require('../utils/grading');

async function submitScores(req, res) {
  try {
    const { term, session, classId, subjectId, entries } = req.body;

    if (!term || !session || !classId || !subjectId || !entries || !entries.length) {
      return res.status(400).json({ error: 'term, session, classId, subjectId, and entries are required' });
    }

    const results = [];
    for (const entry of entries) {
      const { studentId, ca1 = 0, ca2 = 0, exam = 0 } = entry;
      const total = computeTotal(ca1, ca2, exam);
      const grade = computeGrade(total);

      const score = await prisma.score.upsert({
        where: { studentId_subjectId_term_session: { studentId, subjectId, term, session } },
        update: {
          ca1, ca2, exam, total, grade,
          status: 'PENDING',
          submittedById: req.user.id,
          decidedById: null,
          decidedAt: null,
          rejectionReason: null,
        },
        create: {
          studentId, subjectId, classId, term, session,
          ca1, ca2, exam, total, grade,
          status: 'PENDING',
          submittedById: req.user.id,
        },
      });
      results.push({ studentId, scoreId: score.id });
    }

    res.status(201).json({ message: 'Scores submitted', results });
  } catch (err) {
    console.error('Submit scores error:', err);
    res.status(500).json({ error: 'Could not submit scores' });
  }
}

async function getPendingScores(req, res) {
  try {
    const { classId, subjectId, term, session } = req.query;
    const where = { status: 'PENDING' };
    if (classId) where.classId = classId;
    if (subjectId) where.subjectId = subjectId;
    if (term) where.term = term;
    if (session) where.session = session;

    const scores = await prisma.score.findMany({
      where,
      include: { student: true, subject: true },
      orderBy: { submittedById: 'asc' }
    });
    res.json({ scores });
  } catch (err) {
    console.error('Get pending scores error:', err);
    res.status(500).json({ error: 'Could not fetch pending scores' });
  }
}

async function decideScore(req, res) {
  try {
    const { id } = req.params;
    const { decision, rejectionReason } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      return res.status(400).json({ error: 'decision must be APPROVED or REJECTED' });
    }

    const score = await prisma.score.update({
      where: { id },
      data: {
        status: decision,
        decidedById: req.user.id,
        decidedAt: new Date(),
        rejectionReason: decision === 'REJECTED' ? (rejectionReason || 'Not specified') : null
      }
    });
    res.json({ score });
  } catch (err) {
    console.error('Decide score error:', err);
    res.status(500).json({ error: 'Could not update score decision' });
  }
}

async function editScore(req, res) {
  try {
    const { id } = req.params;
    const { ca1, ca2, exam } = req.body;
    const total = computeTotal(ca1, ca2, exam);
    const grade = computeGrade(total);

    const score = await prisma.score.update({
      where: { id },
      data: { ca1, ca2, exam, total, grade }
    });
    res.json({ score });
  } catch (err) {
    console.error('Update score error:', err);
    res.status(500).json({ error: 'Could not update score' });
  }
}

async function deleteScore(req, res) {
  try {
    const { id } = req.params;
    await prisma.score.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    console.error('Delete score error:', err);
    res.status(500).json({ error: 'Could not delete score' });
  }
}

module.exports = { submitScores, getPendingScores, decideScore, editScore, deleteScore };
