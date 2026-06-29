const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please add a customer name' },
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: { msg: 'Customer email already exists' },
    validate: {
      isEmail: { msg: 'Please add a valid email' },
      notEmpty: { msg: 'Please add an email' },
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please add a phone number' },
    },
  },
  company: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  address: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  notes: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
});

module.exports = Customer;
