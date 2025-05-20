const connection = require('../config/database');
const { DataTypes } = require('sequelize');

const PromotionUserModel = connection.define('promotion_user', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  promotion_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'promotion_users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = PromotionUserModel;
