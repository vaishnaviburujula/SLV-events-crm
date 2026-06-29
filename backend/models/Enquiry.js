const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Enquiry = sequelize.define('Enquiry', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  priority: {
    type: DataTypes.ENUM('normal', 'high', 'urgent'),
    defaultValue: 'normal',
  },
  rentalCategory: {
    type: DataTypes.ENUM('Self-Drive', 'Chauffeur Drive', 'Outstation Tour'),
    defaultValue: 'Self-Drive',
  },
  pickupDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      notEmpty: { msg: 'Please add a pickup date' },
    },
  },
  durationDays: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: { args: [1], msg: 'Duration must be at least 1 day' },
    },
  },
  pickupLocation: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please specify a pickup location' },
    },
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  nextFollowUp: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('new', 'contacted', 'follow_up', 'confirmed', 'lost'),
    defaultValue: 'new',
  },
  notes: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
});

module.exports = Enquiry;
