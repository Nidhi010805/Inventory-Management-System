const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new product
exports.createProduct = async (req, res) => {
  const { sku, name, barcode, categoryId, stock, threshold, expiryDate } = req.body;
  const userId = req.user?.id;

  if (!sku || !name || !barcode || !expiryDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const product = await prisma.product.create({
      data: {
        sku,
        name,
        barcode,
        stock,
        threshold,
        expiryDate: new Date(expiryDate),
        categoryId: parseInt(categoryId),
        createdById: userId,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE_PRODUCT',
        target: `Product SKU: ${sku}`,
      },
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create product', details: err.message });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        createdBy: {
          select: { id: true, name: true, role: true },
        },
      },
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch product' });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { sku, name, barcode, categoryId, stock, threshold, expiryDate } = req.body;

  try {
    const existing = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        sku,
        name,
        barcode,
        stock,
        threshold,
        expiryDate: new Date(expiryDate),
        categoryId: parseInt(categoryId),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE_PRODUCT',
        target: `Product SKU: ${sku}`,
      },
    });

    res.json(product);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update product', details: err.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProduct = await prisma.product.delete({ where: { id: parseInt(id) } });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'DELETE_PRODUCT',
        target: `Product SKU: ${deletedProduct.sku}`,
      },
    });

    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete product' });
  }
};
