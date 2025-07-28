const connection = require('../config/database');
const { DataTypes } = require('sequelize');

const AuctionProductModel = connection.define('auction_products', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    auctions_product_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    start_price: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true
    },
    priceStep: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false
    },
    start_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    end_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('upcoming', 'active', 'ended'),
        allowNull: false
    }
}, {
    tableName: 'auction_products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = AuctionProductModel;