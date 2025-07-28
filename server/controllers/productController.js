const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new product
exports.createProduct = async (req, res) => {
  const { sku, name, barcode, stock, threshold, expiryDate, categoryId } = req.body;

  try {
    // Check if SKU or barcode already exists
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

    // Fetch category data if provided
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
        createdById: req.user.id, // from auth middleware
        ...(categoryData?.id && {
          category: {
            connect: { id: categoryData.id },
          },
        }),
      },
      include: {
        category: true,
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    // Create audit log for product creation
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATE_PRODUCT',
        target: `Product SKU: ${sku}, Name: ${name}`,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

// Update product with SKU and barcode uniqueness check (excluding current product)
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { sku, name, barcode, category, stock, threshold, expiryDate } = req.body;

  try {
    const existing = await prisma.product.findUnique({ 
      where: { id: parseInt(id) } 
    });
    
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
        stock: Number(stock),
        threshold: Number(threshold),
        expiryDate: new Date(expiryDate),
        ...(categoryData && {
          category: {
            connect: { id: categoryData.id },
          },
        }),
      },
      include: {
        category: true,
        createdBy: {
          select: { id: true, name: true },
        },
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

// Get all products with enhanced filtering for low stock
exports.getAllProducts = async (req, res) => {
  try {
    const { lowStock, threshold = 10, search, category, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    let whereClause = {};
    
    // Low stock filtering
    if (lowStock === 'true') {
      whereClause.OR = [
        { stock: 0 }, // Out of stock
        { 
          AND: [
            { stock: { gt: 0 } },
            { stock: { lte: parseInt(threshold) } }
          ]
        } // Low stock
      ];
    }

    // Search filtering
    if (search) {
      whereClause.OR = [
        ...(whereClause.OR || []),
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Category filtering
    if (category) {
      whereClause.categoryId = parseInt(category);
    }

    // Dynamic ordering
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        createdBy: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: lowStock === 'true' ? { stock: 'asc' } : orderBy
    });

    // Add stock status to each product
    const productsWithStatus = products.map(product => ({
      ...product,
      stockStatus: product.stock === 0 ? 'out_of_stock' : 
                  product.stock <= (product.threshold || 10) ? 'low_stock' : 'in_stock',
      isLowStock: product.stock <= (product.threshold || 10),
      isOutOfStock: product.stock === 0,
      stockPercentage: Math.round((product.stock / Math.max(product.threshold * 2, 1)) * 100)
    }));

    res.json(productsWithStatus);
  } catch (err) {
    console.error('Error fetching products:', err);
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

    // Add stock status information
    const productWithStatus = {
      ...product,
      stockStatus: product.stock === 0 ? 'out_of_stock' : 
                  product.stock <= (product.threshold || 10) ? 'low_stock' : 'in_stock',
      isLowStock: product.stock <= (product.threshold || 10),
      isOutOfStock: product.stock === 0,
      stockPercentage: Math.round((product.stock / Math.max(product.threshold * 2, 1)) * 100)
    };

    res.json(productWithStatus);
  } catch (err) {
    console.error('Error fetching product:', err);
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
        target: `Product SKU: ${existing.sku}, Name: ${existing.name}`,
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
    return res.status(400).json({ error: 'SKU or barcode is required' });
  }

  try {
    const whereConditions = [];
    
    if (sku) {
      whereConditions.push({ sku });
    }
    
    if (barcode) {
      whereConditions.push({ barcode });
    }

    let whereClause = { OR: whereConditions };
    
    if (excludeId) {
      whereClause.NOT = { id: parseInt(excludeId) };
    }

    const existing = await prisma.product.findFirst({ where: whereClause });

    res.json({ 
      exists: !!existing,
      field: existing ? (existing.sku === sku ? 'sku' : 'barcode') : null,
      message: existing ? `${existing.sku === sku ? 'SKU' : 'Barcode'} already exists` : 'Available'
    });
  } catch (err) {
    console.error('Uniqueness check error:', err);
    res.status(500).json({ error: 'Failed to check uniqueness' });
  }
};

// Get category-wise product count for analytics
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
        category: cat?.name || "Uncategorized",
        count: r._count.id
      };
    });

    // Add uncategorized products
    const uncategorizedCount = await prisma.product.count({
      where: { categoryId: null }
    });

    if (uncategorizedCount > 0) {
      data.push({
        category: "Uncategorized",
        count: uncategorizedCount
      });
    }

    res.json(data);
  } catch (err) {
    console.error('Category count error:', err);
    res.status(500).json({ error: "Failed to fetch category counts" });
  }
};

// Get low stock count for dashboard analytics
exports.getLowStockCount = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;
    
    const lowStockProducts = await prisma.product.findMany({
      where: {
        OR: [
          { stock: 0 },
          { 
            AND: [
              { stock: { gt: 0 } },
              { stock: { lte: parseInt(threshold) } }
            ]
          }
        ]
      },
      select: { id: true, name: true, sku: true, stock: true, threshold: true }
    });

    const outOfStock = lowStockProducts.filter(p => p.stock === 0);
    const lowStock = lowStockProducts.filter(p => p.stock > 0);

    res.json({ 
      total: lowStockProducts.length,
      outOfStock: outOfStock.length,
      lowStock: lowStock.length,
      products: lowStockProducts
    });
  } catch (err) {
    console.error('Low stock count error:', err);
    res.status(500).json({ error: "Failed to fetch low stock data" });
  }
};

// Get recent product activity (created/updated in last 7 days)
exports.getRecentActivity = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - parseInt(days));

    const recent = await prisma.product.findMany({
      where: {
        OR: [
          { createdAt: { gte: dateThreshold } },
          { updatedAt: { gte: dateThreshold } },
        ],
      },
      include: {
        category: { select: { name: true } },
        createdBy: { select: { name: true } }
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 50 // Limit to 50 most recent
    });

    res.json(recent);
  } catch (err) {
    console.error('Recent activity error:', err);
    res.status(500).json({ error: "Failed to fetch recent activity" });
  }
};

// Get comprehensive stock status for dashboard
exports.getStockStatus = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      select: { 
        id: true, 
        name: true, 
        sku: true, 
        stock: true, 
        threshold: true,
        category: { select: { name: true } }
      }
    });

    const stockAnalysis = {
      total: products.length,
      outOfStock: products.filter(p => p.stock === 0).length,
      lowStock: products.filter(p => p.stock > 0 && p.stock <= (p.threshold || 10)).length,
      inStock: products.filter(p => p.stock > (p.threshold || 10)).length,
      totalValue: products.reduce((sum, p) => sum + p.stock, 0),
      averageStock: products.length > 0 ? Math.round(products.reduce((sum, p) => sum + p.stock, 0) / products.length) : 0,
      products: products.map(product => ({
        ...product,
        status: product.stock === 0 ? 'out_of_stock' : 
                product.stock <= (product.threshold || 10) ? 'low_stock' : 'in_stock',
        stockPercentage: Math.round((product.stock / Math.max(product.threshold * 2, 1)) * 100)
      }))
    };

    res.json(stockAnalysis);
  } catch (error) {
    console.error('Error fetching stock status:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update product stock only (for quick stock adjustments)
exports.updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, note = '' } = req.body;

    if (stock < 0) {
      return res.status(400).json({ error: 'Stock cannot be negative' });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { 
        stock: parseInt(stock), 
        updatedAt: new Date() 
      },
      include: {
        category: true,
        createdBy: { select: { id: true, name: true } }
      }
    });

    // Create audit log for stock update
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'ADJUSTMENT',
        target: `Product ID: ${id}, Quantity: ${parseInt(stock) - existingProduct.stock}, Note: Stock adjustment - ${note}`,
      },
    });

    // Add stock status information
    const productWithStatus = {
      ...updatedProduct,
      stockStatus: updatedProduct.stock === 0 ? 'out_of_stock' : 
                  updatedProduct.stock <= (updatedProduct.threshold || 10) ? 'low_stock' : 'in_stock',
      isLowStock: updatedProduct.stock <= (updatedProduct.threshold || 10),
      isOutOfStock: updatedProduct.stock === 0,
      stockPercentage: Math.round((updatedProduct.stock / Math.max(updatedProduct.threshold * 2, 1)) * 100)
    };

    res.json(productWithStatus);
  } catch (error) {
    console.error('Error updating product stock:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Bulk update products (for batch operations)
exports.bulkUpdateProducts = async (req, res) => {
  try {
    const { products } = req.body; // Array of { id, stock, threshold?, note? }

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Products array is required' });
    }

    const results = [];
    const errors = [];

    for (const productUpdate of products) {
      try {
        const { id, stock, threshold, note } = productUpdate;

        if (!id || stock === undefined) {
          errors.push(`Product update missing required fields: id and stock`);
          continue;
        }

        const existingProduct = await prisma.product.findUnique({
          where: { id: parseInt(id) }
        });

        if (!existingProduct) {
          errors.push(`Product with ID ${id} not found`);
          continue;
        }

        const updateData = { 
          stock: parseInt(stock), 
          updatedAt: new Date() 
        };

        if (threshold !== undefined) {
          updateData.threshold = parseInt(threshold);
        }

        const updatedProduct = await prisma.product.update({
          where: { id: parseInt(id) },
          data: updateData
        });

        // Create audit log
        await prisma.auditLog.create({
          data: {
            userId: req.user.id,
            action: 'BULK_UPDATE',
            target: `Product ID: ${id}, Stock: ${stock}${threshold ? `, Threshold: ${threshold}` : ''}, Note: ${note || 'Bulk update'}`,
          },
        });

        results.push({
          id: updatedProduct.id,
          name: existingProduct.name,
          sku: existingProduct.sku,
          previousStock: existingProduct.stock,
          newStock: updatedProduct.stock,
          success: true
        });

      } catch (error) {
        errors.push(`Error updating product ${productUpdate.id}: ${error.message}`);
      }
    }

    res.json({
      message: 'Bulk update completed',
      successful: results.length,
      failed: errors.length,
      results,
      errors
    });

  } catch (error) {
    console.error('Error in bulk update:', error);
    res.status(500).json({ error: 'Server error during bulk update' });
  }
};

module.exports = {
  createProduct: exports.createProduct,
  updateProduct: exports.updateProduct,
  getAllProducts: exports.getAllProducts,
  getProductById: exports.getProductById,
  deleteProduct: exports.deleteProduct,
  checkUnique: exports.checkUnique,
  getCategoryWiseCount: exports.getCategoryWiseCount,
  getLowStockCount: exports.getLowStockCount,
  getRecentActivity: exports.getRecentActivity,
  getStockStatus: exports.getStockStatus,
  updateProductStock: exports.updateProductStock,
  bulkUpdateProducts: exports.bulkUpdateProducts
};