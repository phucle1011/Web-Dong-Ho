const connection = require('../config/database');
const { DataTypes } = require('sequelize');
const BusesModel = require('./busesModel');

const SeatsModel = connection.define('Seats', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    busID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    seatNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('sold', 'empty', 'maintenance'),
        allowNull: true,
    },
}, {
    tableName: 'seats',
    timestamps: false,
});

module.exports = SeatsModel;