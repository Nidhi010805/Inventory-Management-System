const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new product with SKU and barcode uniqueness check
exports.createProduct = async (req, res) => {
  const { sku, name, barcode, category, stock, threshold, expiryDate } = req.body;

  try {
    const product = await prisma.product.create({
      data: {
        sku,
        name,
        barcode,
        stock,
        threshold,
        expiryDate: new Date(expiryDate),
        category: {
          connect: { id: category }, // assuming category is ID
        },
      },
    });

    res.status(201).json(product);
  } catch (err) {
  console.error("Product creation error:", err);
  

  if (err.code === 'P2002') {
    const duplicateField = err.meta?.target?.includes('sku')
      ? 'SKU'
      : err.meta?.target?.includes('barcode')
      ? 'Barcode'
      : 'Field';

    return res.status(400).json({
      error: `${duplicateField} already exists. Please use a different one.`,
    });
  }

  res.status(500).json({
    error: 'Failed to create product. Please try again.',
  });
}

};


// Update product with SKU and barcode uniqueness check (excluding current product)
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { sku, name, barcode, category, stock, threshold, expiryDate } = req.body;

  try {
    const existing = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    // Check SKU uniqueness excluding current product
    const skuExists = await prisma.product.findFirst({
      where: {
        sku,
        NOT: { id: parseInt(id) },
      },
    });
    if (skuExists) {
      return res.status(400).json({ error: `SKU "${sku}" already exists.` });
    }

    // Check barcode uniqueness excluding current product
    const barcodeExists = await prisma.product.findFirst({
      where: {
        barcode,
        NOT: { id: parseInt(id) },
      },
    });
    if (barcodeExists) {
      return res.status(400).json({ error: `Barcode "${barcode}" already exists.` });
    }

    let categoryData = null;

    if (category?.id) {
      categoryData = await prisma.category.findUnique({ where: { id: category.id } });
    }

    if (!categoryData && category?.name) {
      categoryData = await prisma.category.findFirst({ where: { name: category.name } });

      if (!categoryData) {
        categoryData = await prisma.category.create({
          data: { name: category.name },
        });
      }
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        sku,
        name,
        barcode,
        stock,
        threshold,
        expiryDate: new Date(expiryDate),
        ...(categoryData && {
          category: {
            connect: { id: categoryData.id },
          },
        }),
      },
      include: {
        category: true,
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
    console.error("Update error:", err);
    res.status(400).json({ error: 'Failed to update product', details: err.message });
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

// Delete a product by ID
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'DELETE_PRODUCT',
        target: `Product SKU: ${existing.sku}`,
      },
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
// Check SKU or Barcode uniqueness (for live frontend validation)
exports.checkUnique = async (req, res) => {
  const { sku, barcode, excludeId } = req.query;

  if (!sku && !barcode) {
    return res.status(400).json({ error: 'sku or barcode query param required' });
  }

  try {
    const conditions = [];

    if (sku) conditions.push({ sku });
    if (barcode) conditions.push({ barcode });

    const where = {
      OR: conditions,
      ...(excludeId ? { NOT: { id: Number(excludeId) } } : {}),
    };

    const found = await prisma.product.findFirst({ where });

    if (found) {
      if (sku && found.sku === sku) return res.json({ exists: true, field: 'sku' });
      if (barcode && found.barcode === barcode) return res.json({ exists: true, field: 'barcode' });
    }

    res.json({ exists: false });
  } catch (err) {
    console.error('Check unique error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
