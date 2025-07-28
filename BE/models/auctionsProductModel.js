const connection = require('../config/database');
const { DataTypes } = require('sequelize');

const AuctionProductModel = connection.define('auction_products', {
   id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: true
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "auction_product",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at"
});

module.exports = AuctionProductModel;