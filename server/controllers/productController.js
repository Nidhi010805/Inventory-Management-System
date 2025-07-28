const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();



exports.createProduct = async (req, res) => {
  const { sku, name, barcode, stock, threshold, expiryDate, categoryId } = req.body;

  try {
    const existingProduct = await prisma.product.findFirst({
      where: {
        OR: [
          { sku: sku },
          { barcode: barcode },
        ],
      },
    });

    if (existingProduct) {
      return res.status(400).json({
        error: existingProduct.sku === sku
          ? 'SKU already exists'
          : 'Barcode already exists',
      });
    }

    let categoryData = null;
    if (categoryId !== undefined && categoryId !== null && categoryId !== '') {
      categoryData = await prisma.category.findUnique({
        where: { id: Number(categoryId) },
      });

      if (!categoryData) {
        return res.status(404).json({ error: 'Category not found' });
      }
    }

    const product = await prisma.product.create({
      data: {
        sku,
        name,
        barcode,
        stock: Number(stock),
        threshold: Number(threshold),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        ...(categoryData?.id && {
          category: {
            connect: { id: categoryData.id },
          },
        }),
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};



exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { sku, name, barcode, category, stock, threshold, expiryDate } = req.body;

  try {
    const existing = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const skuExists = await prisma.product.findFirst({
      where: {
        sku,
        NOT: { id: parseInt(id) },
      },
    });
    if (skuExists) {
      return res.status(400).json({ error: `SKU "${sku}" already exists.` });
    }

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

exports.getCategoryWiseCount = async (req, res) => {
  try {
    const result = await prisma.product.groupBy({
      by: ['categoryId'],
      _count: { id: true },
    });

    const categories = await prisma.category.findMany();

    const data = result.map(r => {
      const cat = categories.find(c => c.id === r.categoryId);
      return {
        category: cat?.name || "Unknown",
        count: r._count.id
      };
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch category counts" });
  }
};

exports.getLowStockCount = async (req, res) => {
  try {
    const lowStock = await prisma.product.findMany({
      where: {
        stock: {
          lt: prisma.product.fields.threshold,
        },
      },
    });
    res.json({ count: lowStock.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch low stock data" });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recent = await prisma.product.findMany({
      where: {
        OR: [
          { createdAt: { gte: sevenDaysAgo } },
          { updatedAt: { gte: sevenDaysAgo } },
        ],
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    res.json(recent);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch recent activity" });
  }
};
