const connection = require('../config/database');
const { DataTypes } = require('sequelize');

const ContactModel = connection.define('Contact', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    fullName: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    status: {
        type: DataTypes.TINYINT(1),
        allowNull: true,
        defaultValue: 0
    },
    question: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    reply: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    reply_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'contact',
    timestamps: false,
});

module.exports = ContactModel;
