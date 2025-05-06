const connection = require('../config/database');
const { DataTypes } = require('sequelize');

const PromotionProductModel = connection.define('promotion_products', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    promotion_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    discount_type: {
        type: DataTypes.ENUM('fixed','percentage'),
        allowNull: true
    },
    discount_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    tableName: 'promotion_roducts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = PromotionProductModel;