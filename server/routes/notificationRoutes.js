const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Get user notifications
router.get('/', notificationController.getNotifications);

// Mark notification as read
router.patch('/:id/read', notificationController.markAsRead);

// Mark all notifications as read
router.patch('/read-all', notificationController.markAllAsRead);

// Notification preferences
router.get('/preferences', notificationController.getPreferences);
router.post('/preferences', notificationController.updatePreferences);

// Admin-only routes
router.post('/send-alerts', notificationController.sendLowStockAlerts);
router.get('/stats', notificationController.getNotificationStats);

module.exports = router;