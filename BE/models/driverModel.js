const connection = require('../config/database');
const { DataTypes } = require('sequelize');

const DriverModel = connection.define('Driver', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    licenseNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    experienceYears: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    birthDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: true,
    },
    createdAt: {
        type: DataTypes.TIME,
        allowNull: true,
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    image_info: {
        type: DataTypes.JSON,
        allowNull: true,
    },

    licenseType: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    hireDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },

}, {
    tableName: 'drivers',
    timestamps: false,
});

module.exports = DriverModel;