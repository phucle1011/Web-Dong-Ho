const flash = require('express-flash');
const connection = require('../config/database');
const { DataTypes } = require('sequelize');
const SeatsModel = require('./seatsModel');

const BusesModel = connection.define('Buses',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    plateNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    busTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
    },
    totalSeats: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
 
}, {
    tableName: 'buses',
    timestamps: false,
});

module.exports = BusesModel;
