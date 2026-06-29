const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');

const dbName = process.env.DB_NAME || 'event_crm';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASS || '';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || '3306';

// Initialize Sequelize
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    // Relax SQL mode to prevent "Incorrect date value: '0000-00-00'" errors during sync/alter
    sessionVariables: {
      sql_mode: 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'
    }
  },
  define: {
    timestamps: true,
  },
});

const connectDB = async () => {
  try {
    // 1. Ensure database exists
    const connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();

    // 2. Connect
    await sequelize.authenticate();
    console.log('MySQL Database connected successfully via Sequelize.');
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
