const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new product
exports.createProduct = async (req, res) => {
  const { sku, name, barcode, category, stock, threshold, expiryDate } = req.body;

  try {
    let categoryData = null;

    // ✅ If category comes with ID, use it directly
    if (category?.id) {
      categoryData = await prisma.category.findUnique({ where: { id: category.id } });
    }

    // ✅ If category comes with name (and not found by ID), use name
    if (!categoryData && category?.name) {
      categoryData = await prisma.category.findFirst({ where: { name: category.name } });

      // ✅ If not found, create it
      if (!categoryData) {
        categoryData = await prisma.category.create({
          data: { name: category.name },
        });
      }
    }

    const product = await prisma.product.create({
      data: {
        sku,
        name,
        barcode,
        stock,
        threshold,
        expiryDate: new Date(expiryDate),

        // ✅ Connect category if found/created
        ...(categoryData && {
          category: {
            connect: { id: categoryData.id },
          },
        }),
      },
      include: {
        category: true, // ✅ So frontend gets populated category
      },
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("Product creation error:", err);
    res.status(500).json({ error: "Failed to create product" });
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

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { sku, name, barcode, category, stock, threshold, expiryDate } = req.body;

  try {
    const existing = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    let categoryData = null;

    // ✅ If category comes with ID, use it directly
    if (category?.id) {
      categoryData = await prisma.category.findUnique({ where: { id: category.id } });
    }

    // ✅ If not found by ID, fallback to name
    if (!categoryData && category?.name) {
      categoryData = await prisma.category.findFirst({ where: { name: category.name } });

      // ✅ If not found by name either, create new
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
        category: true, // ✅ return populated category
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

    // Optional: log who deleted it
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
