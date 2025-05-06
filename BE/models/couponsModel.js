const connection = require('../config/database');
const { DataTypes } = require('sequelize');

const CouponModel = connection.define('coupons', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    code: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    discount_type: {
        type: DataTypes.ENUM('fixed', 'percentage'),
        allowNull: true
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
    status: {
        type: DataTypes.ENUM('active','inactive','upcoming','expired'),
        allowNull: false,
        defaultValue: 'active'
    }
}, {
    tableName: 'coupons',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = CouponModel;