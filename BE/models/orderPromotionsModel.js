const connection = require('../config/database');
const { DataTypes } = require('sequelize');

const OrderPromotionModel = connection.define('order_promotions', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    promotion_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    discount_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    }
}, {
    tableName: 'order_promotions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = OrderPromotionModel;