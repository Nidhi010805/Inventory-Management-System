# Comprehensive Inventory Management System

A full-stack inventory management system built with Node.js, React, PostgreSQL, and modern web technologies. This system provides real-time stock tracking, automated alerts, comprehensive logging, and user management features.

## 🚀 Features

### Backend Features
- **Real-time Stock Management**: Process sales, returns, and restocks with automatic logging
- **Automated Notifications**: Email alerts for low stock and out-of-stock items
- **Comprehensive Logging**: Track all inventory movements with detailed audit trails
- **User Management**: Role-based access control (Admin/Staff)
- **Email Integration**: Support for both Nodemailer and SendGrid
- **Security**: Rate limiting, input validation, and JWT authentication
- **Database Transactions**: Ensure data consistency for stock operations

### Frontend Features
- **Interactive Dashboard**: Real-time inventory overview with charts and metrics
- **Color-coded Stock Indicators**: Visual status indicators (red/yellow/green)
- **Advanced Filtering**: Filter products by stock status, category, date ranges
- **Stock Update Forms**: Easy-to-use forms for sales, returns, and restocking
- **Notification Management**: User preference settings and notification center
- **Responsive Design**: Mobile-friendly interface
- **Toast Notifications**: Real-time feedback for user actions

### API Endpoints

#### Stock Management
- `POST /api/inventory/sale` - Process a sale (decreases stock)
- `POST /api/inventory/return` - Process a return (increases stock)
- `POST /api/inventory/restock` - Restock inventory (increases stock)
- `GET /api/inventory/products` - Get all products with stock levels
- `GET /api/inventory/low-stock` - Get products below threshold

#### Inventory Logs
- `GET /api/inventory/logs` - Get inventory logs with filters
- `POST /api/inventory/logs` - Create manual log entry

#### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/preferences` - Update notification preferences
- `POST /api/notifications/send-alerts` - Manual trigger for alerts (Admin only)

#### User Management
- `GET /api/users` - Get all users (Admin only)
- `POST /api/users` - Create new user (Admin only)
- `PUT /api/users/me` - Update own profile
- `GET /api/users/stats` - User statistics (Admin only)

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- Git

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Nidhi010805/Inventory-Management-System.git
cd Inventory-Management-System
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Database Setup

#### Option A: Using Local PostgreSQL
1. Install PostgreSQL on your system
2. Create a database named `inventory_management`
3. Create a user with appropriate permissions

#### Option B: Using Docker
```bash
docker run --name inventory-postgres -e POSTGRES_DB=inventory_management -e POSTGRES_USER=inventory_user -e POSTGRES_PASSWORD=inventory_password -p 5432:5432 -d postgres:15
```

### 4. Environment Configuration

#### Backend Configuration
Copy the example environment file:
```bash
cd server
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/inventory_management"

# JWT
JWT_SECRET="your-super-secure-jwt-secret"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV=development

# Email (choose one)
# Option 1: Gmail SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="Inventory System <noreply@inventory.com>"

# Option 2: SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@inventory.com

# Features
EMAIL_ENABLED=true
LOW_STOCK_CHECK_INTERVAL=300000

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=http://localhost:3000
```

### 5. Database Migration
```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

### 6. Seed Database (Optional)
```bash
cd server
npx prisma db seed
```

### 7. Start the Application

#### Development Mode
```bash
# From root directory
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend client on http://localhost:3000

#### Production Mode
```bash
# Build frontend
cd client
npm run build

# Start backend
cd ../server
npm start
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)
```bash
# Clone the repository
git clone https://github.com/Nidhi010805/Inventory-Management-System.git
cd Inventory-Management-System

# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec backend npx prisma migrate deploy

# View logs
docker-compose logs -f
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Individual Docker Images
```bash
# Build backend
cd server
docker build -t inventory-backend .

# Build frontend
cd ../client
docker build -t inventory-frontend .

# Run with docker
docker run -p 5000:5000 inventory-backend
docker run -p 3000:3000 inventory-frontend
```

## 📊 Database Schema

### Core Tables
- **Users**: User accounts with roles and notification preferences
- **Products**: Product information with stock levels and thresholds
- **InventoryLogs**: Detailed logs of all inventory operations
- **Notifications**: User notifications for alerts and system messages
- **Categories**: Product categorization
- **AuditLog**: Legacy audit trail (maintained for backward compatibility)

### Key Fields
- **Products**: `currentStock`, `minThreshold`, `price`, `sku`, `barcode`
- **InventoryLogs**: `actionType`, `quantityChange`, `previousStock`, `newStock`
- **Notifications**: `type`, `message`, `isRead`, `userId`, `productId`

## 🔧 Configuration

### Email Setup

#### Gmail SMTP
1. Enable 2-factor authentication
2. Generate an App Password
3. Use App Password in `EMAIL_PASS`

#### SendGrid
1. Create SendGrid account
2. Generate API key
3. Verify sender identity
4. Use API key in `SENDGRID_API_KEY`

### Notification Settings
- `LOW_STOCK_CHECK_INTERVAL`: How often to check for low stock (milliseconds)
- `EMAIL_ENABLED`: Enable/disable email notifications
- `NOTIFICATION_BATCH_SIZE`: Number of notifications to process at once

### Security Settings
- `JWT_SECRET`: Secret key for JWT tokens (use a strong, random string)
- `RATE_LIMIT_WINDOW_MS`: Rate limiting window
- `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per window

## 🧪 Testing

### Backend Tests
```bash
cd server
npm test
```

### Frontend Tests
```bash
cd client
npm test
```

### E2E Tests
```bash
# Install Playwright
npm install -g @playwright/test

# Run E2E tests
npx playwright test
```

## 📱 Usage

### Default Accounts
After seeding the database:
- **Admin**: admin@inventory.com / admin123
- **Staff**: staff@inventory.com / staff123

### Basic Workflow
1. **Login** with your credentials
2. **Add Products** through the Products page
3. **Set Stock Thresholds** for automatic alerts
4. **Process Operations** (sales, returns, restocks)
5. **Monitor Dashboard** for real-time insights
6. **Review Logs** for audit trails
7. **Configure Notifications** in settings

### Stock Operations
- **Sale**: Decreases stock, logs transaction
- **Return**: Increases stock, logs return
- **Restock**: Adds new inventory, logs addition
- **Adjustment**: Manual stock corrections

## 🔍 Monitoring & Analytics

### Dashboard Metrics
- Total products and inventory value
- Low stock and out-of-stock counts
- Stock distribution charts
- Recent activity feeds

### Notification Types
- **LOW_STOCK**: Product below threshold
- **OUT_OF_STOCK**: Product completely depleted
- **EXPIRY_WARNING**: Products nearing expiration
- **SYSTEM_ALERT**: System notifications

### Export Features
- CSV export of inventory logs
- Filtered data exports
- Date range selections

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Error
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Verify connection
psql -h localhost -U inventory_user -d inventory_management
```

#### Email Not Sending
1. Check email credentials
2. Verify SMTP settings
3. Check firewall/network restrictions
4. Review application logs

#### Frontend Build Errors
```bash
# Clear cache and reinstall
cd client
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Permission Errors
```bash
# Fix node_modules permissions
sudo chown -R $(whoami) node_modules
```

### Log Locations
- Application logs: Console output
- Error logs: `stderr`
- Access logs: Available through middleware

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configurations
- Write tests for new features
- Update documentation
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Support

- **Issues**: GitHub Issues tab
- **Documentation**: This README and inline code comments
- **Email**: admin@inventory.com (demo)

## 🔄 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics and reporting
- [ ] Barcode scanning integration
- [ ] Multi-location inventory
- [ ] Supplier management
- [ ] Purchase order automation
- [ ] API rate limiting improvements
- [ ] GraphQL API option

## 🏗️ Architecture

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   └── api/            # API client
│   └── Dockerfile
├── server/                 # Node.js backend
│   ├── controllers/        # Route handlers
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   ├── services/           # Business logic
│   ├── prisma/             # Database schema
│   └── Dockerfile
├── docker-compose.yml      # Multi-container setup
└── README.md              # This file
```

## 🌟 Acknowledgments

- Express.js for the backend framework
- React for the frontend framework
- Prisma for database ORM
- PostgreSQL for robust data storage
- Tailwind CSS for styling
- Recharts for data visualization

---

Built with ❤️ for efficient inventory management