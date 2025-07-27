// controllers/userController.js
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const emailService = require('../services/emailService');

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
        username: true,
        email: true,
        role: true,
        notificationPreferences: true,
        createdAt: true,
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update user profile
exports.updateMyProfile = [
  body('name').optional().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('username').optional().isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, username, email } = req.body;
      const updateData = {};

      if (name) updateData.name = name;
      if (username) updateData.username = username;
      if (email) updateData.email = email;

      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: updateData,
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          role: true,
          notificationPreferences: true,
          createdAt: true,
        }
      });

      res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Username or email already exists' });
      }
      console.error('Error updating user profile:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
];

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { page = 1, limit = 20, role, search } = req.query;
    const where = {};

    if (role && ['ADMIN', 'STAFF'].includes(role)) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        notificationPreferences: true,
        createdAt: true,
        _count: {
          select: {
            products: true,
            inventoryLogs: true,
            notifications: { where: { isRead: false } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    const total = await prisma.user.count({ where });

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create new user (admin only)
exports.createUser = [
  body('name').isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('username').isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['ADMIN', 'STAFF']).withMessage('Role must be ADMIN or STAFF'),

  async (req, res) => {
    try {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, username, email, password, role } = req.body;
      const bcryptjs = require('bcryptjs');
      const hashedPassword = await bcryptjs.hash(password, 12);

      const defaultNotificationPreferences = {
        email: {
          enabled: true,
          lowStock: true,
          stockOut: true,
          systemAlerts: true
        }
      };

      const user = await prisma.user.create({
        data: {
          name,
          username,
          email,
          password: hashedPassword,
          role,
          notificationPreferences: defaultNotificationPreferences
        },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
        }
      });

      // Send welcome email
      await emailService.sendWelcomeEmail(user);

      res.status(201).json({ 
        message: 'User created successfully', 
        user 
      });

    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Username or email already exists' });
      }
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
];

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

    // Prevent self-role change
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { role },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });

    res.json({ message: 'Role updated successfully', user });
  } catch (error) {
    console.error('Error updating user role:', error);
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
    const userId = Number(id);

    // Prevent self-deletion
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Check if user exists and get their details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.user.delete({ where: { id: userId } });
    
    res.json({ 
      message: `User ${user.name} (${user.email}) deleted successfully` 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user statistics (admin only)
exports.getUserStats = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const totalUsers = await prisma.user.count();
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    const staffCount = await prisma.user.count({ where: { role: 'STAFF' } });
    
    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    });

    res.json({
      totalUsers,
      adminCount,
      staffCount,
      recentUsers
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
