const connection = require('../config/database');
const { DataTypes } = require('sequelize');

const OrderCouponModel = connection.define('order_coupons', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    coupon_id: {
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
    tableName: 'order_coupons',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = OrderCouponModel;