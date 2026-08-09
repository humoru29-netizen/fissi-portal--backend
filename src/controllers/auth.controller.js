const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { signToken } = require('../utils/jwt');

async function signup(req, res) {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ error: 'fullName, email, password and role are required' });
    }

    const validRoles = ['STUDENT', 'TEACHER', 'CASHIER', 'ADMIN'];
    if (!validRoles.includes(role.toUpperCase())) {
      return res.status(400).json({ error: `role must be one of ${validRoles.join(', ')}` });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const userCount = await prisma.user.count();
    const isFirstUser = userCount === 0;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: isFirstUser ? 'ADMIN' : role.toUpperCase(),
        signupStatus: isFirstUser ? 'APPROVED' : 'PENDING',
      },
    });

    if (!isFirstUser) {
      return res.status(201).json({
        message: 'Signup received. An admin must approve your account before you can log in.',
        user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
      });
    }

    const token = signToken({ id: user.id, role: user.role });
    return res.status(201).json({
      message: 'First account created — you are now the admin.',
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Something went wrong during signup' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.signupStatus === 'PENDING') {
      return res.status(403).json({ error: 'Your account is awaiting admin approval' });
    }
    if (user.signupStatus === 'REJECTED') {
      return res.status(403).json({ error: 'Your account signup was rejected' });
    }

    const token = signToken({ id: user.id, role: user.role });
    return res.json({
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Something went wrong during login' });
  }
}

async function me(req, res) {
  const { id, fullName, email, role, signupStatus } = req.user;
  return res.json({ user: { id, fullName, email, role, signupStatus } });
}

module.exports = { signup, login, me };
