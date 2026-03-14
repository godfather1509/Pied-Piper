import fs from 'fs/promises';
import { Op } from 'sequelize';
import { File } from '../models/File.js';

/**
 * Deletes files from disk and their records from the database if they have expired.
 */
export const cleanupExpiredFiles = async () => {
    try {
        console.log('--- Running Scheduled Cleanup ---');
        
        // Find all records where expires_at is less than the current time
        const expiredFiles = await File.findAll({
            where: {
                expires_at: {
                    [Op.lt]: new Date()
                }
            }
        });

        if (expiredFiles.length === 0) {
            console.log('No expired files found.');
            return;
        }

        console.log(`Found ${expiredFiles.length} expired files. Starting deletion...`);

        for (const fileRecord of expiredFiles) {
            const pathsToDelete = [fileRecord.path, fileRecord.compressed_path].filter(Boolean);

            for (const filePath of pathsToDelete) {
                try {
                    await fs.unlink(filePath);
                    console.log(`Deleted file: ${filePath}`);
                } catch (unlinkErr) {
                    // Ignore error if file doesn't exist on disk
                    if (unlinkErr.code !== 'ENOENT') {
                        console.error(`Error deleting file ${filePath}:`, unlinkErr);
                    }
                }
            }

            // Delete the database record
            await fileRecord.destroy();
            console.log(`Removed DB record for: ${fileRecord.original_name}`);
        }

        console.log('--- Cleanup Finished ---');
    } catch (error) {
        console.error('Error during expired files cleanup:', error);
    }
};

/**
 * Starts a recurring interval to clean up expired files.
 * @param {number} intervalMs - Frequency of checks (default: 1 hour)
 */
export const startFileCleanup = (intervalMs = 60 * 60 * 1000) => {
    // Run once immediately on start
    cleanupExpiredFiles();
    
    // Then run on interval
    setInterval(cleanupExpiredFiles, intervalMs);
};
