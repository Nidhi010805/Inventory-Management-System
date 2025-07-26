// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // ✅ Correct import

// Protected route: Get current user profile
router.get('/me', protect, userController.getMyProfile);

// (Optional) Get all users — admin only
router.get('/all', protect, userController.getAllUsers);

// (Optional) Update user role
router.put('/:id/role', protect, userController.updateUserRole);

// (Optional) Delete user
router.delete('/:id', protect, userController.deleteUser);

module.exports = router;
