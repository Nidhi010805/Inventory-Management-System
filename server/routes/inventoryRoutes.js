const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// New Stock Management APIs
router.post('/sale', 
  inventoryController.validateStockOperation,
  inventoryController.processSale
);

router.post('/return', 
  inventoryController.validateStockOperation,
  inventoryController.processReturn
);

router.post('/restock', 
  inventoryController.validateStockOperation,
  inventoryController.processRestock
);

// Enhanced Product and Stock APIs
router.get('/products', inventoryController.getAllProductsWithStock);
router.get('/low-stock', inventoryController.getLowStockProducts);

// Enhanced Inventory Logs APIs
router.get('/logs', inventoryController.getInventoryLogs);
router.post('/logs', inventoryController.addInventory); // For manual log creation

// Legacy routes for backward compatibility
router.post('/', inventoryController.addInventory);
router.get('/', inventoryController.getInventoryRecords);
router.get('/product/:productId', inventoryController.getInventoryByProduct);
router.delete('/:id', inventoryController.deleteInventoryRecord);

module.exports = router;
