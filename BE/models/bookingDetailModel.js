const connection = require('../config/database');
const { DataTypes } = require('sequelize');
const BookingModel = require('./bookingModel');
const SeatModel = require('./seatsModel');
const BookingDetailModel = connection.define('BookingDetail', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    bookingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    seatsId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    seatNumber: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    tableName: 'bookingdetail',
    timestamps: false,
});

module.exports = BookingDetailModel;