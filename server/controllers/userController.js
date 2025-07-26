// controllers/userController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get logged-in user profile (GET /me)
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id; // assuming middleware sets req.user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Update user role (admin only)
exports.updateUserRole = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }
    const { id } = req.params;
    const { role } = req.body;
    if (!['ADMIN', 'STAFF'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { role },
    });
    res.json({ message: 'Role updated', user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }
    const { id } = req.params;
    await prisma.user.delete({ where: { id: Number(id) } });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
