const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalAdmins = await prisma.user.count({ where: { role: 'ADMIN' } });
    const totalStaff = await prisma.user.count({ where: { role: 'STAFF' } });

    const totalProducts = await prisma.product.count();
    const totalCategories = await prisma.category.count();
    const totalLogs = await prisma.auditLog.count();

    res.status(200).json({
      users: {
        total: totalUsers,
        admins: totalAdmins,
        staff: totalStaff,
      },
      products: totalProducts,
      categories: totalCategories,
      auditLogs: totalLogs,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
