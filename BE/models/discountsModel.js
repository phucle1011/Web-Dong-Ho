const connection = require('../config/database');
const { DataTypes } = require('sequelize');

const DiscountModel = connection.define('discounts', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    code: {
        type: DataTypes.STRING,
        allowNull: true
    },
    discount_percent: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    discount_price: {
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
    status: {
        type: DataTypes.ENUM('active','expired'),
        allowNull: false,
        defaultValue: 'active'
    }
}, {
    tableName: 'discounts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = DiscountModel;