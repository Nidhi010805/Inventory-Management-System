const { body, validationResult } = require('express-validator');
const notificationService = require('../services/notificationService');

// Get user notifications
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    const result = await notificationService.getUserNotifications(req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      unreadOnly: unreadOnly === 'true'
    });

    res.json(result);

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await notificationService.markAsRead(parseInt(id), req.user.id);
    
    res.json({ message: 'Notification marked as read', notification });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const result = await notificationService.markAllAsRead(req.user.id);
    
    res.json({ 
      message: 'All notifications marked as read',
      count: result.count 
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update notification preferences
exports.updatePreferences = [
  body('preferences').isObject().withMessage('Preferences must be an object'),
  body('preferences.email.enabled').optional().isBoolean().withMessage('Email enabled must be boolean'),
  body('preferences.email.lowStock').optional().isBoolean().withMessage('Low stock email preference must be boolean'),
  body('preferences.email.stockOut').optional().isBoolean().withMessage('Stock out email preference must be boolean'),
  body('preferences.email.systemAlerts').optional().isBoolean().withMessage('System alerts email preference must be boolean'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { preferences } = req.body;
      
      const updatedPreferences = await notificationService.updateNotificationPreferences(
        req.user.id, 
        preferences
      );
      
      res.json({ 
        message: 'Notification preferences updated successfully',
        preferences: updatedPreferences 
      });

    } catch (error) {
      console.error('Error updating notification preferences:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
];

// Get notification preferences
exports.getPreferences = async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { notificationPreferences: true }
    });

    const defaultPreferences = {
      email: {
        enabled: true,
        lowStock: true,
        stockOut: true,
        systemAlerts: true
      },
      push: {
        enabled: false,
        lowStock: false,
        stockOut: false,
        systemAlerts: false
      }
    };

    res.json({
      preferences: user?.notificationPreferences || defaultPreferences
    });

  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Manual trigger for low stock alerts (admin only)
exports.sendLowStockAlerts = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    // Trigger low stock check manually
    await notificationService.checkAndNotifyLowStock();
    
    res.json({ message: 'Low stock alert check triggered successfully' });

  } catch (error) {
    console.error('Error triggering low stock alerts:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get notification statistics (admin only)
exports.getNotificationStats = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const stats = await prisma.notification.groupBy({
      by: ['type'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    });

    const unreadCount = await prisma.notification.count({
      where: { isRead: false }
    });

    const totalUsers = await prisma.user.count();

    res.json({
      stats: stats.reduce((acc, stat) => {
        acc[stat.type] = stat._count.id;
        return acc;
      }, {}),
      unreadCount,
      totalUsers
    });

  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
};