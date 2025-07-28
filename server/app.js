const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const dashboardRoutes = require('./routes/dashboard');
const stockRoutes = require('./routes/stockRoutes'); 
const { protect } = require('./middleware/authMiddleware');

const app = express();

app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
  'http://localhost:3000',
  'https://inventory-management-system-steel-sigma.vercel.app'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200,
}));



// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/users', userRoutes);
app.use('/api/inventory', protect, inventoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/stock', protect, stockRoutes); 
app.use('/api/admin', protect, dashboardRoutes);

app.get('/', (req, res) => {
  res.send('✅ Inventory Management System backend is running!');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));