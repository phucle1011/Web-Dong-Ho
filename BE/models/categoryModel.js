const connection = require('../config/database');
const { DataTypes } = require('sequelize');

const Category = connection.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    tableName: 'categories',
    timestamps: true,
});

module.exports = Category;