// JWT utilities for DRISHTI
// Handles token generation and verification

const jwt = require('jsonwebtoken');

// Generate access token (expires in 15 minutes)
function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '15m'
  });
}

// Generate refresh token (expires in 7 days)
function generateRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d'
  });
}

// Verify token
function verifyToken(token, secret = process.env.JWT_SECRET) {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}

// Middleware to verify access token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  authenticateToken
};