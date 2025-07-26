const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Utility function to create JWT token
const createToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '3d' }
  );
};

// POST /api/auth/register
exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    });

    const token = createToken(user);

    res
      .cookie('token', token, { httpOnly: true, maxAge: 3 * 24 * 60 * 60 * 1000 })
      .status(201)
      .json({ message: 'User registered successfully.', user: { id: user.id, name: user.name, role: user.role } });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

// POST /api/auth/login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required.' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });

    const token = createToken(user);

    res
      .cookie('token', token, { httpOnly: true, maxAge: 3 * 24 * 60 * 60 * 1000 })
      .status(200)
      .json({ message: 'Login successful.', user: { id: user.id, name: user.name, role: user.role } });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

// GET /api/auth/logout
exports.logoutUser = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully.' });
};
