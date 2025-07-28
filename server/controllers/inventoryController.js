const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.addInventory = async (req, res) => {
  try {
    const {
      productId,
      quantity,   
      action,       
      note,           
    } = req.body;

    if (!productId || !quantity || !action) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const newStock = product.stock + quantity;
    if (newStock < 0) {
      return res.status(400).json({ error: 'Stock cannot be negative' });
    }

    await prisma.product.update({
      where: { id: Number(productId) },
      data: { stock: newStock },
    });

    const inventoryLog = await prisma.auditLog.create({
      data: {
        userId: req.user.id, 
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

exports.getInventoryByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const logs = await prisma.auditLog.findMany({
      where: {
        target: {
          contains: `Product ID: ${productId}`, 
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

exports.updateInventoryRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, quantity, note, productId } = req.body;

    if (!action || !quantity || !productId) {
      return res.status(400).json({ error: 'Missing required fields: action, quantity, productId' });
    }

    const existingLog = await prisma.auditLog.findUnique({
      where: { id: Number(id) },
    });

    if (!existingLog) {
      return res.status(404).json({ error: 'Inventory log not found' });
    }

    const oldTargetMatch = existingLog.target.match(/Quantity: (-?\d+)/);
    const oldQuantity = oldTargetMatch ? parseInt(oldTargetMatch[1]) : 0;

    const quantityDifference = parseInt(quantity) - oldQuantity;

    const product = await prisma.product.findUnique({ 
      where: { id: Number(productId) } 
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const newStock = product.stock + quantityDifference;
    
    if (newStock < 0) {
      return res.status(400).json({ 
        error: `Stock cannot be negative. Current: ${product.stock}, Attempted change: ${quantityDifference}` 
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: Number(productId) },
        data: { stock: newStock },
      });

      const updatedLog = await tx.auditLog.update({
        where: { id: Number(id) },
        data: {
          action,
          target: `Product ID: ${productId}, Quantity: ${quantity}, Note: ${note || ''}`,
          userId: req.user.id,
          timestamp: new Date(), 
        },
      });

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
