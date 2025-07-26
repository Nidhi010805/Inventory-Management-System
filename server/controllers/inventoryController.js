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
