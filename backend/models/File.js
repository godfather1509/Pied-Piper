import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const UploadedFile = sequelize.define('UploadedFile', {
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
        allowNull: false
    },
    size: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'uploaded_files',
    timestamps: true,
    createdAt: 'upload_time',
    updatedAt: false
});

export const CompressedFile = sequelize.define('CompressedFile', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    uploaded_file_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: UploadedFile,
            key: 'id'
        }
    },
    compressed_path: {
        type: DataTypes.STRING,
        allowNull: false
    },
    compressed_size: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'compressed_files',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// Define Relationships
UploadedFile.hasOne(CompressedFile, { foreignKey: 'uploaded_file_id', onDelete: 'CASCADE' });
CompressedFile.belongsTo(UploadedFile, { foreignKey: 'uploaded_file_id' });