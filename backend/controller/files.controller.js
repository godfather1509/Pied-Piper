import dotenv from 'dotenv'
import { Encoder } from './encoder.js'
import path from 'path'
import fs from 'fs'
import fsPromise from 'fs/promises'
import { sequelize } from '../config/db.js'
import { File } from '../models/File.js'

dotenv.config()

export const getFile = async (req, res) => {
    try {
        // Fetch the most recently uploaded file 
        const latestFile = await File.findOne({
            order: [['upload_time', 'DESC']]
        });

        if (!latestFile) {
            return res.status(404).json({ success: false, message: 'No files found' });
        }

        // Generate the dynamic download link
        const downloadLink = `${req.protocol}://${req.get('host')}/api/file/download/${latestFile.id}`;

        res.status(200).json({
            success: true,
            downloadLink,
            filename: latestFile.original_name,
            metadata: {
                originalSize: latestFile.size,
                compressedSize: latestFile.compressed_size,
                compressionPercentage: latestFile.compression_percentage,
                expiresAt: latestFile.expires_at
            }
        });
    } catch (error) {
        console.error("Error in getFile: ", error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
}

export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded or invalid file type. Only .txt allows.' });
        }
        console.log(req.file)
        const file = req.file;

        // Perform compression
        const compressedFile = await Encoder(file.path);

        // Delete the original uploaded file from disk
        if (fs.existsSync(file.path)) {
            await fsPromise.unlink(file.path);
        }

        let compressedPath = null;
        let compressedSize = null;
        let compressionPercentage = null;

        if (compressedFile) {
            // Flexible processing to handle returning a string or an object { path, size }
            compressedPath = typeof compressedFile === 'string' ? compressedFile : (compressedFile.path || null);
            compressedSize = typeof compressedFile === 'object' && compressedFile.size ? compressedFile.size : null;

            if (compressedSize !== null && file.size > 0) {
                // Compression % calculation: ((original - compressed) / original) * 100
                compressionPercentage = parseFloat(((file.size - compressedSize) / file.size * 100).toFixed(2));
            }
        }

        // Set expiry to 24 hours from now
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Save file info inside a safe transaction
        const fileRecord = await File.create({
            original_name: file.originalname,
            filename: file.filename,
            path: null, // Original file deleted
            size: file.size,
            compressed_path: compressedPath,
            compressed_size: compressedSize,
            compression_percentage: compressionPercentage,
            expires_at: expiresAt
        });

        // Generate the dynamic download link for the response
        const downloadLink = `${req.protocol}://${req.get('host')}/api/file/download/${fileRecord.id}`;

        res.status(201).json({
            success: true,
            message: 'File uploaded, compressed, and saved to DB successfully',
            downloadLink,
            metadata: {
                originalSize: fileRecord.size,
                compressedSize: fileRecord.compressed_size,
                compressionPercentage: fileRecord.compression_percentage,
                expiresAt: fileRecord.expires_at
            },
            file: {
                id: fileRecord.id,
                original_name: fileRecord.original_name,
                filename: fileRecord.filename,
                path: fileRecord.path,
                size: fileRecord.size,
                compressed_path: fileRecord.compressed_path,
                compressed_size: fileRecord.compressed_size,
                compression_percentage: fileRecord.compression_percentage,
                expires_at: fileRecord.expires_at
            }
        });
    } catch (error) {
        console.error("Error in uploadFile: ", error);
        res.status(500).json({ success: false, message: 'Server error during file upload', error: error.message });
    }
}

export const downloadFile = async (req, res) => {
    try {
        const { id } = req.params;
        const fileRecord = await File.findByPk(id);

        if (!fileRecord) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        // Check for expiry
        if (fileRecord.expires_at && new Date() > new Date(fileRecord.expires_at)) {
            return res.status(410).json({ success: false, message: 'Link has expired' });
        }

        const filePath = fileRecord.compressed_path || fileRecord.path;

        if (filePath && fs.existsSync(filePath)) {
            // Set friendly filename for download
            res.download(filePath, fileRecord.original_name); // this downloads the file in users machine
        } else {
            res.status(404).json({ success: false, message: 'File not found on server' });
        }
    } catch (error) {
        console.error("Error in downloadFile: ", error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
}