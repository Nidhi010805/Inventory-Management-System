const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, '..', 'data', 'dummyProducts.json'); // ✅ fixed path
  const products = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  for (const product of products) {
    // Ensure category exists or create it
    const category = await prisma.category.upsert({
      where: { id: product.categoryId },
      update: {},
      create: {
        id: product.categoryId,
        name: product.category.name,
      },
    });

    // Insert product
    await prisma.product.create({
      data: {
        sku: product.sku,
        name: product.name,
        barcode: product.barcode,
        stock: product.stock,
        threshold: product.threshold,
        expiryDate: new Date(product.expiryDate),
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(product.updatedAt),
        category: {
          connect: { id: category.id },
        },
        createdBy: {
          connect: { id: 1 }, // 👈 Make sure user with id=1 exists
        },
      },
    });

    console.log(`✅ Seeded: ${product.name}`);
  }

  console.log('\n🎉 All products seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
