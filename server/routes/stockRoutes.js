const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { protect } = require('../middleware/authMiddleware');

const prisma = new PrismaClient();
const router = express.Router();

// Update stock on sale (reduce quantity)
router.post('/sale', protect, async (req, res) => {
  try {
    const { productId, quantity, orderId } = req.body;
    
    // Validation
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID and valid quantity are required' 
      });
    }

    // Get current product
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    // Check if enough stock available
    if (product.stock < quantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}` 
      });
    }

    // Update stock
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(productId) },
      data: { 
        stock: product.stock - quantity,
        updatedAt: new Date()
      }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'SALE',
        target: `Product: ${product.name} (SKU: ${product.sku}) - Quantity: ${quantity}${orderId ? ` - Order: ${orderId}` : ''}`,
        timestamp: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Stock updated successfully for sale',
      data: {
        productId: updatedProduct.id,
        productName: updatedProduct.name,
        previousStock: product.stock,
        currentStock: updatedProduct.stock,
        quantitySold: quantity,
        orderId: orderId || null
      }
    });

  } catch (error) {
    console.error('Sale stock update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Update stock on return (increase quantity)
router.post('/return', protect, async (req, res) => {
  try {
    const { productId, quantity, returnReason, orderId } = req.body;
    
    // Validation
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID and valid quantity are required' 
      });
    }

    // Get current product
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    // Update stock
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(productId) },
      data: { 
        stock: product.stock + quantity,
        updatedAt: new Date()
      }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'RETURN',
        target: `Product: ${product.name} (SKU: ${product.sku}) - Quantity: ${quantity}${returnReason ? ` - Reason: ${returnReason}` : ''}${orderId ? ` - Order: ${orderId}` : ''}`,
        timestamp: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Stock updated successfully for return',
      data: {
        productId: updatedProduct.id,
        productName: updatedProduct.name,
        previousStock: product.stock,
        currentStock: updatedProduct.stock,
        quantityReturned: quantity,
        returnReason: returnReason || null,
        orderId: orderId || null
      }
    });

  } catch (error) {
    console.error('Return stock update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Update stock on restock (increase quantity from supplier)
router.post('/restock', protect, async (req, res) => {
  try {
    const { productId, quantity, supplierInfo, batchNumber, expiryDate } = req.body;
    
    // Validation
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID and valid quantity are required' 
      });
    }

    // Get current product
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    // Prepare update data
    const updateData = { 
      stock: product.stock + quantity,
      updatedAt: new Date()
    };

    // Update expiry date if provided
    if (expiryDate) {
      updateData.expiryDate = new Date(expiryDate);
    }

    // Update stock
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(productId) },
      data: updateData
    });

    // Log the action
    const logDetails = [
      `Product: ${product.name} (SKU: ${product.sku})`,
      `Quantity: ${quantity}`,
      supplierInfo ? `Supplier: ${supplierInfo}` : null,
      batchNumber ? `Batch: ${batchNumber}` : null,
      expiryDate ? `Expiry: ${expiryDate}` : null
    ].filter(Boolean).join(' - ');

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'RESTOCK',
        target: logDetails,
        timestamp: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Stock restocked successfully',
      data: {
        productId: updatedProduct.id,
        productName: updatedProduct.name,
        previousStock: product.stock,
        currentStock: updatedProduct.stock,
        quantityAdded: quantity,
        supplierInfo: supplierInfo || null,
        batchNumber: batchNumber || null,
        newExpiryDate: expiryDate || null
      }
    });

  } catch (error) {
    console.error('Restock update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get stock movement history for a product
router.get('/history/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    const logs = await prisma.auditLog.findMany({
      where: {
        target: {
          contains: product.sku
        },
        action: {
          in: ['SALE', 'RETURN', 'RESTOCK']
        }
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        product: {
          id: product.id,
          name: product.name,
          sku: product.sku,
          currentStock: product.stock
        },
        history: logs
      }
    });

  } catch (error) {
    console.error('Stock history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Bulk stock operations
router.post('/bulk-update', protect, async (req, res) => {
  try {
    const { operations } = req.body; // Array of operations
    
    if (!Array.isArray(operations) || operations.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Operations array is required' 
      });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < operations.length; i++) {
      const operation = operations[i];
      const { type, productId, quantity } = operation;

      try {
        const product = await prisma.product.findUnique({
          where: { id: parseInt(productId) }
        });

        if (!product) {
          errors.push(`Operation ${i + 1}: Product with ID ${productId} not found`);
          continue;
        }

        let newStock;
        let actionType;

        switch (type) {
          case 'sale':
            if (product.stock < quantity) {
              errors.push(`Operation ${i + 1}: Insufficient stock for product ${product.name}`);
              continue;
            }
            newStock = product.stock - quantity;
            actionType = 'SALE';
            break;
          case 'return':
            newStock = product.stock + quantity;
            actionType = 'RETURN';
            break;
          case 'restock':
            newStock = product.stock + quantity;
            actionType = 'RESTOCK';
            break;
          default:
            errors.push(`Operation ${i + 1}: Invalid operation type '${type}'`);
            continue;
        }

        const updatedProduct = await prisma.product.update({
          where: { id: parseInt(productId) },
          data: { stock: newStock, updatedAt: new Date() }
        });

        await prisma.auditLog.create({
          data: {
            userId: req.user.id,
            action: actionType,
            target: `BULK - Product: ${product.name} (SKU: ${product.sku}) - Quantity: ${quantity}`,
            timestamp: new Date()
          }
        });

        results.push({
          productId: updatedProduct.id,
          productName: updatedProduct.name,
          operation: type,
          quantity,
          previousStock: product.stock,
          currentStock: updatedProduct.stock
        });

      } catch (opError) {
        errors.push(`Operation ${i + 1}: ${opError.message}`);
      }
    }

    res.json({
      success: errors.length === 0,
      message: `Processed ${results.length} operations successfully${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
      data: { results, errors }
    });

  } catch (error) {
    console.error('Bulk stock update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

module.exports = router;