const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.post('/', inventoryController.addInventory);
router.get('/', inventoryController.getInventoryRecords);
router.get('/product/:productId', inventoryController.getInventoryByProduct);
router.delete('/:id', inventoryController.deleteInventoryRecord);

module.exports = router;
