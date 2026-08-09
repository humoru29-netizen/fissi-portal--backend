const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;

function signToken(payload) {
  if (!SECRET) throw new Error('JWT_SECRET is not set in environment variables');
  return jwt.sign(payload, SECRET, { expiresIn: '30d' });
}

function verifyToken(token) {
  if (!SECRET) throw new Error('JWT_SECRET is not set in environment variables');
  return jwt.verify(token, SECRET);
}

module.exports = { signToken, verifyToken };
