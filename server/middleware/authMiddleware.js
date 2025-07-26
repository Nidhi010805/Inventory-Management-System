const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Middleware to verify JWT and attach user to req
exports.protect = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: 'Not authorized, token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user; // Attach user to request
    next();

  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check if user has specific role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: Insufficient role' });
    }
    next();
  };
};
