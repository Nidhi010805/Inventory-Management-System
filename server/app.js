const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const dashboardRoutes = require('./routes/dashboard');
const stockRoutes = require('./routes/stockRoutes'); // ✅ NEW STOCK ROUTES
const { protect } = require('./middleware/authMiddleware');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/users', userRoutes);
app.use('/api/inventory', protect, inventoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/stock', protect, stockRoutes); // ✅ NEW STOCK MANAGEMENT API
app.use('/api/admin', protect, dashboardRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));