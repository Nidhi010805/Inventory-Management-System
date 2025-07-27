const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function main() {
  const dataPath = path.join(__dirname, '../data/categories.json'); // ✅ yahan path update kiya
  const categoriesData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  for (const category of categoriesData) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {},
      create: category,
    });
  }

  console.log('✅ Categories seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding categories:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
