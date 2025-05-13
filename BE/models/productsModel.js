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
        slug: {
            type: DataTypes.STRING,
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
        thumbnail: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.TINYINT,
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