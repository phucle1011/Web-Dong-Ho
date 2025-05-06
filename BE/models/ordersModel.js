const connection = require('../config/database');
const { DataTypes } = require('sequelize');

const OrderModel = connection.define('orders', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending','paid','shipped','completed','canceled'),
        allowNull: false,
        defaultValue: 'pending'
    },
    payment_method: {
        type: DataTypes.ENUM('COD','VnPay','Momo'),
        allowNull: true
    },
    cancellation_reason: {
        type: DataTypes.STRING,
        allowNull: false 
    },
    shipping_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false 
    },
    order_code: {
        type: DataTypes.STRING,
        allowNull: false 
    },
    shipping_address: {
        type: DataTypes.TEXT,
        allowNull: false 
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: false 
    },
    is_deleted: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    }    
}, {
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = OrderModel;