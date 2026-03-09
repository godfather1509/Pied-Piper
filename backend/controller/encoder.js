import fsPromise from 'fs/promises';
import path from 'path';

export const Encoder = async (inputPath) => {
    try {
        // 1. Read the uploaded file from the controller
        const data = await fsPromise.readFile(inputPath, 'utf8');

        // TODO: Implement actual Huffman Encoding logic on 'data'
        // For now, we pretend we compressed it by just assigning it
        const compressedData = huffmanEncoder(data);

        // 2. Generate a new file path for the compressed output
        const dir = path.dirname(inputPath);
        const ext = path.extname(inputPath);
        const basename = path.basename(inputPath, ext);
        const compressedPath = path.join(dir, `${basename}_compressed${ext}`);

        // 3. Write the "compressed" content to the new file
        await fsPromise.writeFile(compressedPath, compressedData, 'utf8');

        // 4. Get the size of the newly written compressed file
        const stats = await fsPromise.stat(compressedPath);

        // 5. Send the compressed file info back to the controller
        return {
            path: compressedPath,
            size: stats.size
        };
    } catch (error) {
        console.error("Compression failed:", error);
        throw error;
    }
};

function huffmanEncoder(data) {

    const compressedData = data;


    return compressedData
}