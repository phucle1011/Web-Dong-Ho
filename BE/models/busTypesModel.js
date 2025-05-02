const connection = require('../config/database');
const { DataTypes } = require('sequelize');

const BusTypesModel = connection.define('BusTypes',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    typeName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    totalSeats: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    tableName: 'busTypes',
    timestamps: false,
});
module.exports = BusTypesModel;
