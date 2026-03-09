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

        // Download the compressed file if available, otherwise fallback to original
        const filePathToDownload = latestFile.compressed_path ? latestFile.compressed_path : latestFile.path;

        if (filePathToDownload && fs.existsSync(filePathToDownload)) {
            // Send the file as an attachment
            res.download(filePathToDownload, 'compressed.txt');
        } else {
            res.status(404).json({ success: false, message: 'File not found on server storage' });
        }
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

        // Perform compression (allow await in case the user implements it asynchronously)
        const compressedFile = await Encoder(file.path);

        let compressedPath = null;
        let compressedSize = null;
        if (compressedFile) {
            // Flexible processing to handle returning a string or an object { path, size }
            compressedPath = typeof compressedFile === 'string' ? compressedFile : (compressedFile.path || null);
            compressedSize = typeof compressedFile === 'object' && compressedFile.size ? compressedFile.size : null;
        }

        // Save incoming txt file inside a safe transaction
        const fileRecord = await File.create({
            original_name: file.originalname,
            filename: file.filename,
            path: file.path,
            size: file.size,
            compressed_path: compressedPath,
            compressed_size: compressedSize
        });

        res.status(201).json({
            success: true,
            message: 'File uploaded, compressed, and saved to DB successfully',
            file: {
                id: fileRecord.id,
                original_name: fileRecord.original_name,
                filename: fileRecord.filename,
                path: fileRecord.path,
                size: fileRecord.size,
                compressed_path: fileRecord.compressed_path,
                compressed_size: fileRecord.compressed_size
            }
        });
    } catch (error) {
        console.error("Error in uploadFile: ", error);
        res.status(500).json({ success: false, message: 'Server error during file upload', error: error.message });
    }
}