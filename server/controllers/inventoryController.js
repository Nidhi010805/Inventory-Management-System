const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const notificationService = require('../services/notificationService');

const prisma = new PrismaClient();

// Validation middleware
exports.validateStockOperation = [
  body('productId').isInt({ min: 1 }).withMessage('Product ID must be a positive integer'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters'),
];

// Helper function to create inventory log with transaction
async function updateStockWithLog(productId, quantityChange, actionType, userId, notes = null) {
  return await prisma.$transaction(async (tx) => {
    // Get current product state
    const product = await tx.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const previousStock = product.currentStock || product.stock; // Handle both new and legacy fields
    const newStock = previousStock + quantityChange;

    if (newStock < 0) {
      throw new Error('Insufficient stock for this operation');
    }

    // Update product stock
    await tx.product.update({
      where: { id: productId },
      data: {
        currentStock: newStock,
        stock: newStock, // Update legacy field for backward compatibility
        updatedAt: new Date()
      }
    });

    // Create inventory log
    const inventoryLog = await tx.inventoryLog.create({
      data: {
        productId,
        actionType,
        quantityChange,
        previousStock,
        newStock,
        userId,
        notes
      },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        user: { select: { id: true, name: true } }
      }
    });

    // Create legacy audit log for backward compatibility
    await tx.auditLog.create({
      data: {
        userId,
        action: actionType,
        target: `Product SKU: ${product.sku}, ${actionType}: ${Math.abs(quantityChange)} units`
      }
    });

    return { inventoryLog, product: { ...product, currentStock: newStock } };
  });
}

// Stock Management APIs
exports.processSale = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity, notes } = req.body;

    const result = await updateStockWithLog(
      parseInt(productId),
      -quantity, // Negative for sale
      'SALE',
      req.user.id,
      notes
    );

    res.status(200).json({
      message: 'Sale processed successfully',
      inventoryLog: result.inventoryLog,
      newStock: result.product.currentStock
    });

  } catch (error) {
    console.error('Error processing sale:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.processReturn = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity, notes } = req.body;

    const result = await updateStockWithLog(
      parseInt(productId),
      quantity, // Positive for return
      'RETURN',
      req.user.id,
      notes
    );

    res.status(200).json({
      message: 'Return processed successfully',
      inventoryLog: result.inventoryLog,
      newStock: result.product.currentStock
    });

  } catch (error) {
    console.error('Error processing return:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.processRestock = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity, notes } = req.body;

    const result = await updateStockWithLog(
      parseInt(productId),
      quantity, // Positive for restock
      'RESTOCK',
      req.user.id,
      notes
    );

    res.status(200).json({
      message: 'Restock processed successfully',
      inventoryLog: result.inventoryLog,
      newStock: result.product.currentStock
    });

  } catch (error) {
    console.error('Error processing restock:', error);
    res.status(400).json({ error: error.message });
  }
};

// Get all products with stock levels
exports.getAllProductsWithStock = async (req, res) => {
  try {
    const { page = 1, limit = 20, sortBy = 'name', sortOrder = 'asc' } = req.query;

    const products = await prisma.product.findMany({
      include: {
        category: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } }
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });

    // Add stock status to each product
    const productsWithStatus = products.map(product => {
      const currentStock = product.currentStock || product.stock;
      const threshold = product.minThreshold || product.threshold;
      
      let stockStatus = 'good';
      if (currentStock === 0) {
        stockStatus = 'out_of_stock';
      } else if (currentStock <= threshold) {
        stockStatus = 'low_stock';
      }

      return {
        ...product,
        stockStatus,
        stockLevel: currentStock
      };
    });

    const total = await prisma.product.count();

    res.json({
      products: productsWithStatus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get products with low stock
exports.getLowStockProducts = async (req, res) => {
  try {
    const lowStockProducts = await prisma.product.findMany({
      where: {
        OR: [
          { currentStock: { lte: prisma.product.fields.minThreshold } },
          { stock: { lte: prisma.product.fields.threshold } } // Legacy support
        ]
      },
      include: {
        category: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } }
      },
      orderBy: [
        { currentStock: 'asc' },
        { name: 'asc' }
      ]
    });

    const productsWithStatus = lowStockProducts.map(product => {
      const currentStock = product.currentStock || product.stock;
      const threshold = product.minThreshold || product.threshold;
      
      return {
        ...product,
        stockStatus: currentStock === 0 ? 'out_of_stock' : 'low_stock',
        stockLevel: currentStock,
        threshold
      };
    });

    res.json({
      products: productsWithStatus,
      summary: {
        total: productsWithStatus.length,
        outOfStock: productsWithStatus.filter(p => p.stockStatus === 'out_of_stock').length,
        lowStock: productsWithStatus.filter(p => p.stockStatus === 'low_stock').length
      }
    });

  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Enhanced inventory logs with filtering
exports.getInventoryLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      productId,
      actionType,
      userId,
      startDate,
      endDate,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = req.query;

    const where = {};

    if (productId) where.productId = parseInt(productId);
    if (actionType) where.actionType = actionType;
    if (userId) where.userId = parseInt(userId);

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    const logs = await prisma.inventoryLog.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, sku: true } },
        user: { select: { id: true, name: true } }
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    const total = await prisma.inventoryLog.count({ where });

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching inventory logs:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Legacy methods for backward compatibility
exports.addInventory = async (req, res) => {
  try {
    const { productId, quantity, action, note } = req.body;

    if (!productId || quantity === undefined || !action) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Map legacy actions to new enum values
    const actionMap = {
      'ADD': 'RESTOCK',
      'REMOVE': 'ADJUSTMENT',
      'TRANSFER': 'ADJUSTMENT'
    };

    const mappedAction = actionMap[action] || 'ADJUSTMENT';
    
    const result = await updateStockWithLog(
      parseInt(productId),
      quantity,
      mappedAction,
      req.user.id,
      note
    );

    res.status(201).json({ 
      message: 'Inventory updated', 
      inventoryLog: result.inventoryLog 
    });

  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getInventoryRecords = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { id: true, name: true } } },
      take: 100 // Limit for performance
    });
    res.json(logs);
  } catch (error) {
    console.error('Error fetching inventory records:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getInventoryByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const logs = await prisma.inventoryLog.findMany({
      where: { productId: parseInt(productId) },
      include: {
        user: { select: { id: true, name: true } }
      },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    res.json(logs);
  } catch (error) {
    console.error('Error fetching inventory records by product:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteInventoryRecord = async (req, res) => {
  try {
    const { id } = req.params;

    // Only allow deletion of audit logs, not inventory logs for data integrity
    await prisma.auditLog.delete({
      where: { id: Number(id) },
    });

    res.status(204).end();
  } catch (error) {
    console.error('Error deleting inventory record:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
