const dotenv = require('dotenv');
// Load environment variables immediately on startup
dotenv.config();
// Triggering nodemon restart...

const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize, connectDB } = require('./config/db');
const errorHandler = require('./middleware/error');
const { User } = require('./models');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/enquiries', require('./routes/enquiryRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Event Enquiry & Booking CRM API' });
});

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Seed default Admin if no users exist
const seedAdmin = async () => {
  try {
    const userCount = await User.count();
    if (userCount === 0) {
      console.log('No users found in MySQL. Seeding default Admin...');
      await User.create({
        name: 'System Admin',
        email: 'admin@eventcrm.com',
        password: 'adminpassword', // Will be hashed by Sequelize beforeCreate hook
        role: 'admin',
        phone: '1234567890',
        status: 'active',
      });
      console.log('Default Admin seeded successfully into MySQL!');
      console.log('Email: admin@eventcrm.com | Password: adminpassword');
    }
  } catch (error) {
    console.error(`Seeding Admin failed: ${error.message}`);
  }
};

const startServer = async () => {
  try {
    // 1. Connect to MySQL Database & create database if not exists
    await connectDB();

    // 2. Synchronize models with MySQL (creates/updates tables automatically)
    console.log('Synchronizing Sequelize models with MySQL database...');
    await sequelize.sync({ alter: true });
    console.log('Sequelize models synchronized successfully.');

    // 3. Seed Admin
    await seedAdmin();

    // 4. Start listening
    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
      console.log(`Unhandled Rejection Error: ${err.message}`);
      server.close(() => process.exit(1));
    });

  } catch (error) {
    console.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();
