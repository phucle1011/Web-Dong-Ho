const connection = require('../config/database');
const { DataTypes } = require('sequelize');

const UserModel = connection.define('users', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending'
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: false 
    },
    role: {
        type: DataTypes.ENUM('user','admin'),
        allowNull: false,
        defaultValue: 'user'
    },
    email_verified_at: {
        type: DataTypes.DATE,
        allowNull: false 
    },
    remember_token: {
        type: DataTypes.STRING,
        allowNull: false 
    },
    status: {
        type: DataTypes.ENUM('active','inactive','pending','locked'),
        allowNull: false,
        defaultValue: 'active'
    },
    lockout_reason: {
        type: DataTypes.STRING,
        allowNull: false
    }    
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = UserModel;