const connection = require('../config/database');
const { DataTypes } = require('sequelize');

const AuctionBidModel = connection.define('auction_bids', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    auction_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    bidAmount: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false
    },
    bidTime: {
        type: DataTypes.TIME,
        allowNull: false
    }
}, {
    tableName: 'auction_bids',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = AuctionBidModel;