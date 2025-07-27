// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Get current user profile
router.get('/me', protect, userController.getMyProfile);

// ✅ Update current user's profile
router.put('/me', protect, userController.updateUserProfile);

// Admin: Get all users
router.get('/all', protect, userController.getAllUsers);

// Admin: Update user role
router.put('/:id/role', protect, userController.updateUserRole);

// Admin: Delete user
router.delete('/:id', protect, userController.deleteUser);

module.exports = router;
