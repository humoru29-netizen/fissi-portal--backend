const PDFDocument = require('pdfkit');

function generateReportCardPDF(res, { student, classInfo, term, session, scores }) {
  const doc = new PDFDocument({ margin: 40 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${student.fullName.replace(/\s+/g, '_')}_${term}_${session}.pdf"`);
  doc.pipe(res);

  doc.fontSize(18).font('Helvetica-Bold').text('Faith International Secondary School Itobe', { align: 'center' });
  doc.fontSize(10).font('Helvetica').text('"In God We Trust"', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(14).font('Helvetica-Bold').text('Student Report Card', { align: 'center' });
  doc.moveDown();

  doc.fontSize(11).font('Helvetica');
  doc.text(`Name: ${student.fullName}`);
  doc.text(`Admission No: ${student.admissionNo}`);
  doc.text(`Class: ${classInfo.name}`);
  doc.text(`Term: ${term}    Session: ${session}`);
  doc.moveDown();

  const startY = doc.y;
  const colX = { subject: 40, ca1: 220, ca2: 280, exam: 340, total: 400, grade: 460, position: 510 };
  doc.font('Helvetica-Bold').fontSize(10);
  doc.text('Subject', colX.subject, startY);
  doc.text('CA1', colX.ca1, startY);
  doc.text('CA2', colX.ca2, startY);
  doc.text('Exam', colX.exam, startY);
  doc.text('Total', colX.total, startY);
  doc.text('Grade', colX.grade, startY);
  doc.text('Pos.', colX.position, startY);
  doc.moveTo(40, startY + 15).lineTo(555, startY + 15).stroke();

  let y = startY + 22;
  doc.font('Helvetica').fontSize(10);
  for (const s of scores) {
    doc.text(s.subject.name, colX.subject, y);
    doc.text(String(s.ca1), colX.ca1, y);
    doc.text(String(s.ca2), colX.ca2, y);
    doc.text(String(s.exam), colX.exam, y);
    doc.text(String(s.total), colX.total, y);
    doc.text(s.grade || '-', colX.grade, y);
    doc.text(s.position ? String(s.position) : '-', colX.position, y);
    y += 18;
  }

  doc.moveDown(2);
  const avg = scores.length ? (scores.reduce((sum, s) => sum + s.total, 0) / scores.length).toFixed(1) : '0.0';
  doc.font('Helvetica-Bold').fontSize(11).text(`Average Score: ${avg}`, 40, y + 10);

  doc.end();
}

module.exports = { generateReportCardPDF };
