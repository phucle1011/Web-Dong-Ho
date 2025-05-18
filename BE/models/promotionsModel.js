const connection = require('../config/database');
const { DataTypes } = require('sequelize');

const PromotionModel = connection.define('Promotion', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  discount_type: {
    type: DataTypes.ENUM('fixed', 'percentage'),
    allowNull: false
  },
  discount_value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  applicable_to: {
    type: DataTypes.ENUM('order', 'product'),
    allowNull: false
  },
  min_price_threshold: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'upcoming', 'expired'),
    allowNull: false,
    defaultValue: 'active'
  }
}, {
  tableName: 'promotions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = PromotionModel;
