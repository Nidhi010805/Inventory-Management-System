const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

// Analytics routes
router.get('/analytics/category-count', productController.getCategoryWiseCount);
router.get('/analytics/low-stock-count', productController.getLowStockCount);
router.get('/analytics/recent-activity', productController.getRecentActivity);

// Stock status routes
router.get('/stock-status', protect, productController.getStockStatus);

// Product CRUD routes
router.post('/', protect, productController.createProduct);
router.get('/', protect, productController.getAllProducts);
router.get('/:id', protect, productController.getProductById);
router.put('/:id', protect, productController.updateProduct);
router.patch('/:id/stock', protect, productController.updateProductStock); // New route for stock updates
router.delete('/:id', protect, productController.deleteProduct);

// Utility routes
router.get('/check-unique', productController.checkUnique);

module.exports = router;