const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please add a name' },
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: { msg: 'Email already in use' },
    validate: {
      isEmail: { msg: 'Please add a valid email' },
      notEmpty: { msg: 'Please add an email' },
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please add a password' },
      len: {
        args: [6, 100],
        msg: 'Password must be at least 6 characters',
      },
    },
  },
  role: {
    type: DataTypes.ENUM('admin', 'employee'),
    defaultValue: 'employee',
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
  },
});

User.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;
