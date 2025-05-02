const connection = require('../config/database');
const { DataTypes } = require('sequelize');
const UserModel = require('./userModel');
const TripModel = require('./tripsModel'); 
const SeatModel = require('./seatsModel'); 
const BusesModel = require('./busesModel');

const BookingModel = connection.define('Booking', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: UserModel,
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
    tripId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: TripModel,
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
    busId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: BusesModel,
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'canceled'),
        allowNull: true,
    },
    finalPrice: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    userName: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    emailUser: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    tableName: 'bookings',
    timestamps: false,
});

module.exports = BookingModel;
