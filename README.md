📦 Real-time Inventory Management System

> A modern, scalable Inventory Management System inspired by real-world logistics workflows used by Amazon, BigBasket, Flipkart, and other enterprise operations.



🚀 Overview

Inventory is the backbone of any business — whether it's e-commerce, retail, or manufacturing. This project is a real-time Inventory Management System that allows organizations to manage products, track stock levels, receive alerts, and make informed decisions through dynamic dashboards and logs.


---

🛠️ Tech Stack

Layer	Technology

Frontend	React.js + Tailwind CSS
Backend	Node.js + Express
Database	PostgreSQL
Notifications	Browser API, Email (NodeMailer), Slack Webhooks
Password Encryption	bcryptjs
Environment Config	dotenv
Auth	JWT + Role-Based Access
Cookies	cookie-parser
Notifications	Email (via NodeMailer), Browser Alerts, Slack Webhooks (optional)
Logging & Seeding	Custom Prisma seed scripts (seed.js, seed-categories.js)
Cross-Origin	CORS enabled



---

📂 Features

🖥 Product Dashboard

Categorized inventory view

Real-time stock levels with search and filters

Live update on product additions/removals


⚠ Instant Alerts

Low-stock browser alerts

Email and Slack notifications for critical items

Reorder triggers based on thresholds


🔐 Secure Authentication

Role-based access: Admin, Staff

JWT authentication

Admin-only access to sensitive reports and logs


📊 Dynamic Reports & Charts

Product usage trends

Low stock statistics

Inventory movement visualized by time period


📜 Inventory Logs

Logs of all inventory activities: additions, removals, transfers

Filter logs by user/date/type

Useful for auditing and rollback



---

💻 Setup Instructions

1. Clone the Repository

git clone https://github.com/yourusername/inventory-management-system.git
cd inventory-management-system

2. Setup Backend

cd server
npm install
cp .env.example .env
# Configure PostgreSQL DB connection in .env
npm start


3. Setup Frontend

cd client
npm install
npm start


---

⚙️ Environment Variables

You'll need to set environment variables for:

Database URL

JWT Secret

Email SMTP Credentials

Slack Webhook URL


Use .env.example as a template.


---

🧪 Example Admin Credentials

Email: admin@example.com
Password: Admin@123


---

📎 Folder Structure

/client      → React UI
/server       → Node.js
/database       → SQL schemas and seeds
/docs           → Documentation and diagrams


---

📈 Future Enhancements

Mobile app version (React Native)

Barcode scanning for stock entry

Multi-warehouse support

Exportable reports (PDF, Excel)

[![Watch the video](https://drive.google.com/file/d/1p9c6IDvVdP4zCP7aAzNTX0Lvk2tSZObG/view?usp=drivesdk)

