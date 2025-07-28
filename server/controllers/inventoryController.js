const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Add inventory movement record (add/remove/transfer stock)
exports.addInventory = async (req, res) => {
  try {
    const {
      productId,
      quantity,       // positive for addition, negative for removal
      action,         // e.g. 'ADD', 'REMOVE', 'TRANSFER'
      note,           // optional note about the action
    } = req.body;

    if (!productId || !quantity || !action) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update product stock accordingly
    const newStock = product.stock + quantity;
    if (newStock < 0) {
      return res.status(400).json({ error: 'Stock cannot be negative' });
    }

    await prisma.product.update({
      where: { id: Number(productId) },
      data: { stock: newStock },
    });

    // Create inventory log (AuditLog)
    const inventoryLog = await prisma.auditLog.create({
      data: {
        userId: req.user.id,  // from auth middleware
        action,
        target: `Product ID: ${productId}, Quantity: ${quantity}, Note: ${note || ''}`,
      },
    });

    res.status(201).json({ message: 'Inventory updated', inventoryLog });
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all inventory records (audit logs)
exports.getInventoryRecords = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { id: true, name: true } } },
    });
    res.json(logs);
  } catch (error) {
    console.error('Error fetching inventory records:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get inventory records filtered by productId
exports.getInventoryByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const logs = await prisma.auditLog.findMany({
      where: {
        target: {
          contains: `Product ID: ${productId}`, // simple string filter
        },
      },
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { id: true, name: true } } },
    });

    res.json(logs);
  } catch (error) {
    console.error('Error fetching inventory records by product:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// NEW: Update inventory record with stock adjustment
exports.updateInventoryRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, quantity, note, productId } = req.body;

    if (!action || !quantity || !productId) {
      return res.status(400).json({ error: 'Missing required fields: action, quantity, productId' });
    }

    // Get the existing log to calculate stock difference
    const existingLog = await prisma.auditLog.findUnique({
      where: { id: Number(id) },
    });

    if (!existingLog) {
      return res.status(404).json({ error: 'Inventory log not found' });
    }

    // Extract old quantity from target string (parsing "Product ID: X, Quantity: Y, Note: Z")
    const oldTargetMatch = existingLog.target.match(/Quantity: (-?\d+)/);
    const oldQuantity = oldTargetMatch ? parseInt(oldTargetMatch[1]) : 0;
    
    // Calculate the difference to adjust stock
    const quantityDifference = parseInt(quantity) - oldQuantity;

    // Get current product stock
    const product = await prisma.product.findUnique({ 
      where: { id: Number(productId) } 
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Calculate new stock level
    const newStock = product.stock + quantityDifference;
    
    if (newStock < 0) {
      return res.status(400).json({ 
        error: `Stock cannot be negative. Current: ${product.stock}, Attempted change: ${quantityDifference}` 
      });
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Update product stock
      await tx.product.update({
        where: { id: Number(productId) },
        data: { stock: newStock },
      });

      // Update the audit log
      const updatedLog = await tx.auditLog.update({
        where: { id: Number(id) },
        data: {
          action,
          target: `Product ID: ${productId}, Quantity: ${quantity}, Note: ${note || ''}`,
          userId: req.user.id, // Track who made the edit
          timestamp: new Date(), // Update timestamp to current time
        },
      });

      // Create an additional audit trail for the edit action
      await tx.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'EDIT_LOG',
          target: `Edited Log ID: ${id}, Old Qty: ${oldQuantity}, New Qty: ${quantity}, Stock Change: ${quantityDifference}`,
        },
      });

      return updatedLog;
    });

    res.json({ 
      message: 'Inventory log updated successfully', 
      log: result,
      stockChange: quantityDifference,
      newStock 
    });

  } catch (error) {
    console.error('Error updating inventory record:', error);
    res.status(500).json({ error: 'Server error during update' });
  }
};

// Delete a specific inventory record
exports.deleteInventoryRecord = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.auditLog.delete({
      where: { id: Number(id) },
    });

    res.status(204).end();
  } catch (error) {
    console.error('Error deleting inventory record:', error);
    res.status(500).json({ error: 'Server error' });
  }
};