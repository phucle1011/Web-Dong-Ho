const connection = require('../config/database');
const { DataTypes } = require('sequelize');

const BrandModel = connection.define('brands', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false // Khớp với bảng
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false // Khớp với bảng
    },
    country: {
        type: DataTypes.STRING,
        allowNull: true // Khớp với bảng
    },
    logo: {
        type: DataTypes.STRING,
        allowNull: true // Khớp với bảng
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true // Khớp với bảng, sửa từ false thành true
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active' // Khớp với bảng
    }
}, {
    tableName: 'brands',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = BrandModel;