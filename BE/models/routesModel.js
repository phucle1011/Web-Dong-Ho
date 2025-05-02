const connection = require('../config/database');
const { DataTypes } = require('sequelize');

const RoutesModel = connection.define('Routes', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    startPoint: {
        type: DataTypes.STRING,
        allowNull: true
    },
    endPoint: {
        type: DataTypes.STRING,
        allowNull: true
    },
    distance: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    time: {
        type: DataTypes.TIME,
        allowNull: true
    },
    startProvinceID: {
        type: DataTypes.INTEGER,
        allowNull: false 
    },
    startDistrictID: {
        type: DataTypes.INTEGER,
        allowNull: false 
    },
    startWardID: {
        type: DataTypes.INTEGER,
        allowNull: false 
    },
    endProvinceID: {
        type: DataTypes.INTEGER,
        allowNull: false 
    },
    endDistrictID: {
        type: DataTypes.INTEGER,
        allowNull: false 
    },
    endWardID: {
        type: DataTypes.INTEGER,
        allowNull: false 
    },
}, {
    tableName: 'routes',
    timestamps: false, 
});

module.exports = RoutesModel;
