import dotenv from 'dotenv'
import { Encoder } from './encoder.js'
import { Decoder } from './decoder.js'
import path from 'path'
import fs from 'fs'
import fsPromise from 'fs/promises'
import { sequelize } from '../config/db.js'
import { File } from '../models/File.js'

dotenv.config()

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
    // this function gets executed when user clicks on download link
    try {
        const { id } = req.params; // get id of file
        const fileRecord = await File.findByPk(id); // find file in database using id

        if (!fileRecord) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        // Check for expiry
        if (fileRecord.expires_at && new Date() > new Date(fileRecord.expires_at)) {
            // this will execute when user tries to download file from expired link
            // delete file from server disk
            if (fs.existsSync(fileRecord.compressed_path)) {
                await fsPromise.unlink(fileRecord.compressed_path);
            }
            // delete file from database
            await fileRecord.destroy();
            return res.status(410).json({ success: false, message: 'Link has expired' });
        }

        const filePath = fileRecord.compressed_path || fileRecord.path;


        if (filePath && fs.existsSync(filePath)) {
            // Generate temporary decompressed file
            const decompressedFile = await Decoder(filePath);

            // Download the file and then delete it from the server disk
            res.download(decompressedFile.path, fileRecord.original_name, (err) => {
                if (err) {
                    console.error("Error during download:", err);
                }

                // Delete the decompressed file regardless of success or error
                fs.unlink(decompressedFile.path, (unlinkErr) => {
                    if (unlinkErr) console.error("Error deleting decompressed file:", unlinkErr);
                });
            });
        } else {
            res.status(404).json({ success: false, message: 'File not found on server' });
        }
    } catch (error) {
        console.error("Error in downloadFile: ", error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
}