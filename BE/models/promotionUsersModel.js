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
  },
  email_sent: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  used: {
    type: DataTypes.BOOLEAN,  // Hoặc DataTypes.TINYINT(1)
    allowNull: false,
    defaultValue: false,      // Mặc định chưa sử dụng
  },
}, {
  tableName: 'promotion_users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = PromotionUserModel;
