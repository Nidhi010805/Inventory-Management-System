// server/app.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

import userRoutes from './routes/userRoutes.js';
import wasteRoutes from './routes/wasteRoutes.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/waste', wasteRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('🌍 Plastic Waste Management API is live...');
});

// Global error handler (optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!', error: err.message });
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
