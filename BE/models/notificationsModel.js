const connection = require('../config/database');
const { DataTypes } = require('sequelize');

const NotificationModel = connection.define('notifications', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    discount_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    data: {
        type: DataTypes.JSON,
        allowNull: true
    },
    read_at: {
        type: DataTypes.DATE,
        allowNull: false 
    }
}, {
    tableName: 'notifications',
    timestamps: true,
    createdAt: 'created_at'
});

module.exports = NotificationModel;