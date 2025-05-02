const connection = require('../config/database');
const { DataTypes } = require('sequelize');

const PaymentModel = connection.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    bookingId : {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    paymentMethod: {
        type: DataTypes.ENUM('VN Pay', 'MOMO'),
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('pending', 'paid', 'failed'),
        allowNull: true,
    },
}, {
    tableName: 'payments',
    timestamps: false,
});

module.exports = PaymentModel;
