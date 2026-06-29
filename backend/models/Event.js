const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please add an event title' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  start: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#4F46E5',
  },
});

module.exports = Event;
