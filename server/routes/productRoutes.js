const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

router.get('/analytics/category-count', productController.getCategoryWiseCount);
router.get('/analytics/low-stock-count', productController.getLowStockCount);
router.get('/analytics/recent-activity', productController.getRecentActivity);

router.post('/', protect, productController.createProduct);
router.get('/', protect, productController.getAllProducts);
router.get('/:id', protect, productController.getProductById);
router.put('/:id', protect, productController.updateProduct);
router.delete('/:id', protect, productController.deleteProduct);

module.exports = router;
