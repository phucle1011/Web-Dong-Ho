const connection = require('../config/database');
const { DataTypes } = require('sequelize');
const UserModel = require('./userModel');

const ReviewModel = connection.define('Review', {
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
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    image: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    status: {
        type: DataTypes.TINYINT,
        allowNull: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW,
    }
}, {
    tableName: 'reviews',
    timestamps: true,
});

ReviewModel.belongsTo(UserModel, { foreignKey: 'userId' });
ReviewModel.belongsTo(UserModel, { foreignKey: 'userId' });

module.exports = ReviewModel;
