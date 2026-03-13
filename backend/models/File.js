import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const File = sequelize.define('File', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    original_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    filename: {
        type: DataTypes.STRING,
        allowNull: false
    },
    path: {
        type: DataTypes.STRING,
        allowNull: true
    },
    size: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    compressed_path: {
        type: DataTypes.STRING,
        allowNull: true
    },
    compressed_size: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    compression_percentage: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'files',
    timestamps: true,
    createdAt: 'upload_time',
    updatedAt: false
});