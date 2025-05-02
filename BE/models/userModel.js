const { DataTypes } = require('sequelize');
const connection = require('../config/database');
const bcrypt = require('bcrypt');

const UserModel = connection.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fullName: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    image: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: true,
        unique: true
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    role: {
        type: DataTypes.TINYINT,
        allowNull: true
    },
    status: {
        type: DataTypes.TINYINT,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updateAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'users',
    timestamps: false,
});

UserModel.beforeCreate(async (user, options) => {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
});

UserModel.comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

module.exports = UserModel;

