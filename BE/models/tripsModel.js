const connection = require('../config/database');
const { DataTypes } = require('sequelize');
const RouteModel = require('../models/routesModel');

const TripsModel = connection.define('Trips',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    busID: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    routeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    driverId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    departureTime: {
        type: DataTypes.TIME,
        allowNull: true,
    },
    arrivalTime: {
        type: DataTypes.TIME,
        allowNull: true,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('scheduled', 'completed', 'canceled'),
        allowNull: true,
    },
}, {
    tableName: 'trips',
    timestamps: false,
});
TripsModel.belongsTo(RouteModel, { as: 'Route', foreignKey: 'routeId' });

module.exports = TripsModel;
