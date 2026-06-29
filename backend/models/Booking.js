const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  vehicleName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please specify a vehicle' },
    },
  },
  pickupDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      notEmpty: { msg: 'Please add a pickup date' },
    },
  },
  pickupLocation: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please specify a pickup location' },
    },
  },
  returnDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      notEmpty: { msg: 'Please add a return date' },
    },
  },
  returnLocation: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please specify a return location' },
    },
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  paidAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  paymentStatus: {
    type: DataTypes.ENUM('unpaid', 'partially_paid', 'fully_paid'),
    defaultValue: 'unpaid',
  },
  status: {
    type: DataTypes.ENUM('confirmed', 'completed', 'cancelled'),
    defaultValue: 'confirmed',
  },
  contractAttachment: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
}, {
  hooks: {
    beforeSave: (booking) => {
      const total = Number(booking.amount);
      const paid = Number(booking.paidAmount);
      
      if (paid <= 0) {
        booking.paymentStatus = 'unpaid';
      } else if (paid >= total) {
        booking.paymentStatus = 'fully_paid';
      } else {
        booking.paymentStatus = 'partially_paid';
      }
    },
  },
});

module.exports = Booking;
