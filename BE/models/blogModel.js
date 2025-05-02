const connection = require('../config/database');
const { DataTypes } = require('sequelize');
const UserModel = require('./userModel'); 

const BlogModel = connection.define('Blog', {
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
    title: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    image: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    createAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: true,
    }
}, {
    tableName: 'blogs',
    timestamps: false,
});

BlogModel.belongsTo(UserModel, { foreignKey: 'userId' });

module.exports = BlogModel;
