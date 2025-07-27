const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// All routes are already protected by verifyUser middleware in app.js
router.post('/', productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

// Single route for checking SKU or Barcode uniqueness
router.get('/check-unique', productController.checkUnique);

module.exports = router;
