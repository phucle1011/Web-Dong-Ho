const connection = require('../config/database');
const { DataTypes } = require('sequelize');

const ProductModel = connection.define('products', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        stock: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        brand_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        discount_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        watch_type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        movement: {
            type: DataTypes.STRING,
            allowNull: false
        },
        dial_color: {
            type: DataTypes.STRING,
            allowNull: false
        },
        case_material: {
            type: DataTypes.STRING,
            allowNull: false
        },
        strap_material: {
            type: DataTypes.STRING,
            allowNull: false
        },
        water_resistance: {
            type: DataTypes.STRING,
            allowNull: false
        },
        glass_material: {
            type: DataTypes.STRING,
            allowNull: false
        },
        size: {
            type: DataTypes.STRING,
            allowNull: false
        },
        weight: {
            type: DataTypes.STRING,
            allowNull: false
        },
        battery_life: {
            type: DataTypes.STRING,
            allowNull: false
        },
        features: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false
        },
        gallery_images: {
            type: DataTypes.JSON,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('active','inactive'),
            allowNull: false,
            defaultValue: 'active'
        }
    }, {
        tableName: 'products',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

module.exports = ProductModel;