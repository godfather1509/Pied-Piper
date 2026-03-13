import fsPromise from 'fs/promises';
import path from 'path';

export const Decoder = async (inputPath) => {
    try {
        // 1. Read the uploaded file from the controller
        const data = await fsPromise.readFile(inputPath, 'utf8');

        const decompressedData = huffmanDecoder(data);

        // 2. Generate a new file path for the decompressed output
        const dir = path.dirname(inputPath);
        const ext = path.extname(inputPath);
        const basename = path.basename(inputPath, ext);
        const decompressedPath = path.join(dir, `${basename}_decompressed${ext}`);

        // 3. Write the "compressed" content to the new file
        await fsPromise.writeFile(decompressedPath, decompressedData, 'utf8');

        // 4. Get the size of the newly written compressed file
        const stats = await fsPromise.stat(decompressedPath);

        // 5. Send the decompressed file info back to the controller
        return {
            path: decompressedPath,
            size: stats.size
        };
    } catch (error) {
        console.error("Decompression failed:", error);
        throw error;
    }
};

function huffmanDecoder(data) {
    console.log("Decompressing data...", data);
    return data;
}