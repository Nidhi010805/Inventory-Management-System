const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Check if category already exists
    const existingCategory = await prisma.category.findUnique({ where: { name } });
    if (existingCategory) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    const category = await prisma.category.create({ data: { name } });
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { products: true },
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update category by ID
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const updatedCategory = await prisma.category.update({
      where: { id: Number(id) },
      data: { name },
    });
    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete category by ID
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.category.delete({
      where: { id: Number(id) },
    });
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
