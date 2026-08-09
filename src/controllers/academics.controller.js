const prisma = require('../config/prisma');

async function listClasses(req, res) {
  const classes = await prisma.class.findMany({ orderBy: { name: 'asc' } });
  res.json({ classes });
}

async function addClass(req, res) {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  try {
    const cls = await prisma.class.create({ data: { name } });
    res.status(201).json({ class: cls });
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Class already exists' });
    res.status(500).json({ error: 'Could not create class' });
  }
}

async function listSubjects(req, res) {
  const subjects = await prisma.subject.findMany({ orderBy: { name: 'asc' } });
  res.json({ subjects });
}

async function addSubject(req, res) {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  try {
    const subject = await prisma.subject.create({ data: { name } });
    res.status(201).json({ subject });
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Subject already exists' });
    res.status(500).json({ error: 'Could not create subject' });
  }
}

module.exports = { listClasses, addClass, listSubjects, addSubject };
