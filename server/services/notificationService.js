const { PrismaClient } = require('@prisma/client');
const emailService = require('./emailService');

const prisma = new PrismaClient();

class NotificationService {
  constructor() {
    this.lowStockCheckInterval = parseInt(process.env.LOW_STOCK_CHECK_INTERVAL) || 300000; // 5 minutes
    this.batchSize = parseInt(process.env.NOTIFICATION_BATCH_SIZE) || 50;
    this.startLowStockMonitoring();
  }

  // Start monitoring for low stock items
  startLowStockMonitoring() {
    console.log(`Starting low stock monitoring with ${this.lowStockCheckInterval}ms interval`);
    
    setInterval(async () => {
      try {
        await this.checkAndNotifyLowStock();
      } catch (error) {
        console.error('Error in low stock monitoring:', error);
      }
    }, this.lowStockCheckInterval);

    // Run initial check
    setTimeout(() => this.checkAndNotifyLowStock(), 5000);
  }

  // Check for low stock and send notifications
  async checkAndNotifyLowStock() {
    try {
      // Find products with low stock
      const lowStockProducts = await prisma.product.findMany({
        where: {
          OR: [
            { currentStock: { lte: prisma.product.fields.minThreshold } },
            { currentStock: 0 }
          ]
        },
        include: {
          category: true,
        }
      });

      if (lowStockProducts.length === 0) {
        return;
      }

      console.log(`Found ${lowStockProducts.length} products with low/no stock`);

      // Separate out-of-stock from low-stock products
      const outOfStockProducts = lowStockProducts.filter(p => p.currentStock === 0);
      const lowStockOnly = lowStockProducts.filter(p => p.currentStock > 0 && p.currentStock <= p.minThreshold);

      // Get users who should receive notifications
      const users = await prisma.user.findMany({
        where: {
          notificationPreferences: {
            path: ['email', 'lowStock'],
            equals: true
          }
        }
      });

      // If no specific preferences, notify all users
      const notificationUsers = users.length > 0 ? users : await prisma.user.findMany();

      // Create notifications and send emails
      for (const user of notificationUsers) {
        await this.createAndSendNotifications(user, outOfStockProducts, lowStockOnly);
      }

    } catch (error) {
      console.error('Error checking low stock:', error);
    }
  }

  async createAndSendNotifications(user, outOfStockProducts, lowStockProducts) {
    try {
      const notifications = [];

      // Create out-of-stock notifications
      for (const product of outOfStockProducts) {
        // Check if we already have a recent notification for this product
        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId: user.id,
            productId: product.id,
            type: 'OUT_OF_STOCK',
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          }
        });

        if (!existingNotification) {
          notifications.push({
            userId: user.id,
            productId: product.id,
            type: 'OUT_OF_STOCK',
            message: `${product.name} (SKU: ${product.sku}) is OUT OF STOCK. Immediate restocking required.`,
          });
        }
      }

      // Create low-stock notifications
      for (const product of lowStockProducts) {
        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId: user.id,
            productId: product.id,
            type: 'LOW_STOCK',
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          }
        });

        if (!existingNotification) {
          notifications.push({
            userId: user.id,
            productId: product.id,
            type: 'LOW_STOCK',
            message: `${product.name} (SKU: ${product.sku}) is running low. Current stock: ${product.currentStock}, Threshold: ${product.minThreshold}`,
          });
        }
      }

      // Batch create notifications
      if (notifications.length > 0) {
        await prisma.notification.createMany({
          data: notifications
        });

        console.log(`Created ${notifications.length} notifications for user ${user.email}`);
      }

      // Send email alerts if user preferences allow
      const userPrefs = user.notificationPreferences || {};
      const emailEnabled = userPrefs.email?.enabled !== false; // Default to true if not specified

      if (emailEnabled) {
        if (outOfStockProducts.length > 0) {
          await emailService.sendStockoutAlert(user, outOfStockProducts);
        }
        
        if (lowStockProducts.length > 0) {
          await emailService.sendLowStockAlert(user, lowStockProducts);
        }
      }

    } catch (error) {
      console.error(`Error creating notifications for user ${user.email}:`, error);
    }
  }

  // Create a general notification
  async createNotification(userId, productId, type, message) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          productId,
          type,
          message,
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          product: { select: { id: true, name: true, sku: true } }
        }
      });

      console.log('Notification created:', notification.id);
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Get notifications for a user
  async getUserNotifications(userId, { page = 1, limit = 20, unreadOnly = false } = {}) {
    try {
      const where = { userId };
      if (unreadOnly) {
        where.isRead = false;
      }

      const notifications = await prisma.notification.findMany({
        where,
        include: {
          product: { select: { id: true, name: true, sku: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });

      const total = await prisma.notification.count({ where });

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      const notification = await prisma.notification.update({
        where: {
          id: notificationId,
          userId: userId // Ensure user can only mark their own notifications
        },
        data: { isRead: true }
      });

      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId: userId,
          isRead: false
        },
        data: { isRead: true }
      });

      return result;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Update user notification preferences
  async updateNotificationPreferences(userId, preferences) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          notificationPreferences: preferences
        }
      });

      return user.notificationPreferences;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  // Clean up old notifications (older than 30 days)
  async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const result = await prisma.notification.deleteMany({
        where: {
          createdAt: { lt: thirtyDaysAgo },
          isRead: true
        }
      });

      console.log(`Cleaned up ${result.count} old notifications`);
      return result;
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();