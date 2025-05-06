const connection = require('../config/database');
const { DataTypes } = require('sequelize');

const PromotionComboModel = connection.define('promotion_combos', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    promotion_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    combo_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    discount_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    tableName: 'promotion_combos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = PromotionComboModel;