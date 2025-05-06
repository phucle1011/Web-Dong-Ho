const connection = require('../config/database');
const { DataTypes } = require('sequelize');

const AddressModel = connection.define('address', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    address_line1: {
        type: DataTypes.STRING,
        allowNull: true
    },
    address_line2: {
        type: DataTypes.STRING,
        allowNull: true
    },
    city: {
        type: DataTypes.STRING,
        allowNull: true
    },
    district: {
        type: DataTypes.STRING,
        allowNull: false 
    },
    province: {
        type: DataTypes.STRING,
        allowNull: false 
    },
    postal_code: {
        type: DataTypes.STRING,
        allowNull: false 
    },
    is_default: {
        type: DataTypes.TINYINT,
        allowNull: false 
    }
}, {
    tableName: 'address',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = AddressModel;