function computeTotal(ca1 = 0, ca2 = 0, exam = 0) {
  return Number(ca1) + Number(ca2) + Number(exam);
}

function computeGrade(total) {
  if (total >= 75) return 'A1';
  if (total >= 70) return 'B2';
  if (total >= 65) return 'B3';
  if (total >= 60) return 'C4';
  if (total >= 55) return 'C5';
  if (total >= 50) return 'C6';
  if (total >= 45) return 'D7';
  if (total >= 40) return 'E8';
  return 'F9';
}

module.exports = { computeTotal, computeGrade };
