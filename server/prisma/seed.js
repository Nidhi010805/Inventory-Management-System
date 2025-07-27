const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Electronics' },
      update: {},
      create: { name: 'Electronics' }
    }),
    prisma.category.upsert({
      where: { name: 'Clothing' },
      update: {},
      create: { name: 'Clothing' }
    }),
    prisma.category.upsert({
      where: { name: 'Food & Beverages' },
      update: {},
      create: { name: 'Food & Beverages' }
    }),
    prisma.category.upsert({
      where: { name: 'Books' },
      update: {},
      create: { name: 'Books' }
    }),
    prisma.category.upsert({
      where: { name: 'Home & Garden' },
      update: {},
      create: { name: 'Home & Garden' }
    })
  ]);

  console.log('✅ Categories created');

  // Create default users
  const adminPassword = await bcryptjs.hash('admin123', 12);
  const staffPassword = await bcryptjs.hash('staff123', 12);

  const defaultNotificationPreferences = {
    email: {
      enabled: true,
      lowStock: true,
      stockOut: true,
      systemAlerts: true
    },
    push: {
      enabled: false,
      lowStock: false,
      stockOut: false,
      systemAlerts: false
    }
  };

  const admin = await prisma.user.upsert({
    where: { email: 'admin@inventory.com' },
    update: {},
    create: {
      name: 'Admin User',
      username: 'admin',
      email: 'admin@inventory.com',
      password: adminPassword,
      role: 'ADMIN',
      notificationPreferences: defaultNotificationPreferences
    }
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@inventory.com' },
    update: {},
    create: {
      name: 'Staff User',
      username: 'staff',
      email: 'staff@inventory.com',
      password: staffPassword,
      role: 'STAFF',
      notificationPreferences: defaultNotificationPreferences
    }
  });

  console.log('✅ Users created');

  // Create sample products
  const products = [
    {
      sku: 'ELEC001',
      name: 'Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      barcode: '1234567890001',
      price: 199.99,
      currentStock: 25,
      stock: 25,
      minThreshold: 5,
      threshold: 5,
      categoryId: categories[0].id,
      createdById: admin.id,
      expiryDate: new Date('2025-12-31')
    },
    {
      sku: 'ELEC002',
      name: 'Smartphone Case',
      description: 'Protective case for smartphones',
      barcode: '1234567890002',
      price: 29.99,
      currentStock: 50,
      stock: 50,
      minThreshold: 10,
      threshold: 10,
      categoryId: categories[0].id,
      createdById: admin.id,
      expiryDate: new Date('2025-12-31')
    },
    {
      sku: 'CLOTH001',
      name: 'Cotton T-Shirt',
      description: 'Comfortable cotton t-shirt',
      barcode: '1234567890003',
      price: 24.99,
      currentStock: 3, // Low stock
      stock: 3,
      minThreshold: 10,
      threshold: 10,
      categoryId: categories[1].id,
      createdById: staff.id,
      expiryDate: new Date('2025-06-30')
    },
    {
      sku: 'CLOTH002',
      name: 'Denim Jeans',
      description: 'Classic blue denim jeans',
      barcode: '1234567890004',
      price: 79.99,
      currentStock: 0, // Out of stock
      stock: 0,
      minThreshold: 5,
      threshold: 5,
      categoryId: categories[1].id,
      createdById: staff.id,
      expiryDate: new Date('2025-06-30')
    },
    {
      sku: 'FOOD001',
      name: 'Organic Coffee Beans',
      description: 'Premium organic coffee beans',
      barcode: '1234567890005',
      price: 18.99,
      currentStock: 100,
      stock: 100,
      minThreshold: 20,
      threshold: 20,
      categoryId: categories[2].id,
      createdById: admin.id,
      expiryDate: new Date('2024-12-31')
    },
    {
      sku: 'BOOK001',
      name: 'JavaScript Guide',
      description: 'Complete guide to JavaScript programming',
      barcode: '1234567890006',
      price: 45.99,
      currentStock: 15,
      stock: 15,
      minThreshold: 5,
      threshold: 5,
      categoryId: categories[3].id,
      createdById: admin.id,
      expiryDate: new Date('2026-12-31')
    },
    {
      sku: 'HOME001',
      name: 'Garden Hose',
      description: 'Flexible garden hose 50ft',
      barcode: '1234567890007',
      price: 34.99,
      currentStock: 8,
      stock: 8,
      minThreshold: 3,
      threshold: 3,
      categoryId: categories[4].id,
      createdById: staff.id,
      expiryDate: new Date('2027-01-01')
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product
    });
  }

  console.log('✅ Products created');

  // Create some sample inventory logs
  const sampleProducts = await prisma.product.findMany();
  
  for (const product of sampleProducts.slice(0, 3)) {
    // Initial stock entry
    await prisma.inventoryLog.create({
      data: {
        productId: product.id,
        actionType: 'RESTOCK',
        quantityChange: product.currentStock,
        previousStock: 0,
        newStock: product.currentStock,
        userId: admin.id,
        notes: 'Initial stock entry'
      }
    });

    // Sample sale
    if (product.currentStock > 5) {
      await prisma.inventoryLog.create({
        data: {
          productId: product.id,
          actionType: 'SALE',
          quantityChange: -2,
          previousStock: product.currentStock,
          newStock: product.currentStock - 2,
          userId: staff.id,
          notes: 'Sample sale transaction'
        }
      });
    }
  }

  console.log('✅ Inventory logs created');

  // Create some sample notifications
  const lowStockProducts = sampleProducts.filter(p => p.currentStock <= p.minThreshold);
  
  for (const product of lowStockProducts) {
    await prisma.notification.create({
      data: {
        userId: admin.id,
        productId: product.id,
        type: product.currentStock === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
        message: product.currentStock === 0 
          ? `${product.name} (SKU: ${product.sku}) is OUT OF STOCK`
          : `${product.name} (SKU: ${product.sku}) is running low. Current stock: ${product.currentStock}, Threshold: ${product.minThreshold}`,
        isRead: false
      }
    });
  }

  console.log('✅ Notifications created');
  
  console.log('🎉 Database seeding completed successfully!');
  console.log('\nDefault accounts:');
  console.log('Admin: admin@inventory.com / admin123');
  console.log('Staff: staff@inventory.com / staff123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
