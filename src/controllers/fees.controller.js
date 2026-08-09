const prisma = require('../config/prisma');

async function recordFee(req, res) {
  const { studentId, term, session, amountDue, amountPaid } = req.body;
  if (!studentId || !term || !session) {
    return res.status(400).json({ error: 'studentId, term and session are required' });
  }

  const fee = await prisma.fee.upsert({
    where: { studentId_term_session: { studentId, term, session } },
    update: {
      amountDue: amountDue ?? undefined,
      amountPaid: { increment: amountPaid || 0 },
    },
    create: {
      studentId, term, session,
      amountDue: amountDue || 0,
      amountPaid: amountPaid || 0,
    },
  });

  res.status(201).json({ fee });
}

async function getStudentFees(req, res) {
  const { studentId } = req.params;
  const fees = await prisma.fee.findMany({
    where: { studentId },
    include: { adjustments: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ fees });
}

async function bulkUploadFees(req, res) {
  const { rows } = req.body;
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: 'rows must be a non-empty array' });
  }

  const results = { updated: 0, failed: [] };
  for (const row of rows) {
    try {
      const student = await prisma.student.findUnique({ where: { admissionNo: row.admissionNo } });
      if (!student) {
        results.failed.push({ admissionNo: row.admissionNo, reason: 'student not found' });
        continue;
      }
      await prisma.fee.upsert({
        where: { studentId_term_session: { studentId: student.id, term: row.term, session: row.session } },
        update: { amountDue: row.amountDue ?? undefined, amountPaid: { increment: Number(row.amountPaid) || 0 } },
        create: { studentId: student.id, term: row.term, session: row.session, amountDue: row.amountDue || 0, amountPaid: row.amountPaid || 0 },
      });
      results.updated++;
    } catch (err) {
      results.failed.push({ admissionNo: row.admissionNo, reason: 'processing error' });
    }
  }
  res.json(results);
}

async function addAdjustment(req, res) {
  const { feeId, label, amount } = req.body;
  if (!feeId || !label || amount === undefined) {
    return res.status(400).json({ error: 'feeId, label and amount are required' });
  }

  const adjustment = await prisma.feeAdjustment.create({
    data: { feeId, label, amount: Number(amount) },
  });

  res.status(201).json({ adjustment });
}

module.exports = { recordFee, getStudentFees, bulkUploadFees, addAdjustment };
