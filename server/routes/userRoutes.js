// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Current user profile routes
router.get('/me', userController.getMyProfile);
router.put('/me', userController.updateMyProfile);

// Admin-only user management routes
router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.put('/:id/role', userController.updateUserRole);
router.delete('/:id', userController.deleteUser);

// Statistics route
router.get('/stats', userController.getUserStats);

module.exports = router;
