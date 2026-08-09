const prisma = require('../config/prisma');
const { computeTotal, computeGrade } = require('../utils/grading');

async function submitScores(req, res) {
  try {
    const { term, session, classId, subjectId, entries } = req.body;

    if (!term || !session || !classId || !subjectId || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: 'term, session, classId, subjectId and a non-empty entries array are required' });
    }

    const results = [];
    for (const entry of entries) {
      const { studentId, ca1 = 0, ca2 = 0, exam = 0 } = entry;
      const total = computeTotal(ca1, ca2, exam);
      const grade = computeGrade(total);

      const existing = await prisma.score.findUnique({
        where: { studentId_subjectId_term_session: { studentId, subjectId, term, session } },
      });

      if (existing && existing.status === 'APPROVED') {
        results.push({ studentId, skipped: true, reason: 'Score already approved — only an admin can modify it' });
        continue;
      }

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
      results.push({ studentId, scoreId: score.id, status: score.status });
    }

    res.status(201).json({ message: 'Scores submitted and awaiting admin approval', results });
  } catch (err) {
    console.error('Submit scores error:', err);
    res.status(500).json({ error: 'Could not submit scores' });
  }
}

async function getPendingScores(req, res) {
  con
