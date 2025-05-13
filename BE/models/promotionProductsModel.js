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
    product_variant_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'promotion_roducts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = PromotionProductModel;