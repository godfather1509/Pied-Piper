import fsPromise from 'fs/promises';
import path from 'path';
import pkg from '@datastructures-js/priority-queue';

export const Encoder = async (inputPath) => {
    // this will encode the file data using huffman encoding
    try {
        // 1. Read the uploaded file from the controller
        const data = await fsPromise.readFile(inputPath, 'utf8');

        // const { compressedData, reverseCodeMap } = huffmanEncoder(data);
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

function huffmanEncoder(feeder) {
    // This is a placeholder for the actual Huffman encoding logic.

    // huffman encoding is a lossless data compression algorithm
    const map = new Map();
    const codeMap = new Map(); // to store the huffman codes for each character
    const { MinPriorityQueue } = pkg;
    const pq = new MinPriorityQueue();

    for (const char of feeder) {
        // console.log(char)
        map.set(char, (map.get(char) || 0) + 1);
    }
    // create a frequency map of characters in feeder
    for (const [char, freq] of map.entries()) {
        const node = {
            char,
            freq,
            left: null,
            right: null
        }
        pq.enqueue(node, freq);
    }

    while (pq.size() > 1) {
        const node1 = pq.dequeue();
        const node2 = pq.dequeue();
        // remove 2 nodes with least frequency from the priority queue

        const newNode = { char: node1.char + node2.char, freq: node1.freq + node2.freq, left: node1, right: node2 }
        // Create new node with frequency equal to the sum of the 2 removed nodes and char data as null. Removed 2 nodes become left and right child of the new node.
        pq.enqueue(newNode, newNode.freq);
        // build the huffman tree using the priority queue
    }

    // console.log("Huffman Tree Root:", pq.front());

    // Generate Huffman codes for each character
    const generateCodes = (node, code = '') => {
        if (node) {
            if (!node.left && !node.right) {
                codeMap.set(node.char, code);
            }
            generateCodes(node.left, code + '0');
            generateCodes(node.right, code + '1');
        }
    };
    generateCodes(pq.dequeue());
    let encode = ""
    for (const char of feeder) {
        encode = encode + codeMap.get(char)
    }
    // console.log(encode);

    const reverseCodeMap = new Map();

    for (const [char, code] of codeMap.entries()) {
        reverseCodeMap.set(code, char);
    }
    // console.log(reverseCodeMap)
    console.log(encode)    
    // return { encode, reverseCodeMap };
    return feeder;

}

/*
    1. Pass the string(feeder) to compressor function
    2. Inside compressor, calculate frequency of each character in the string(create a frequency map)
    3. For every key in the frequency map create a node and insert that node into a priority queue (min-heap) based on frequency
       Node has: char data(character of string), int const(frequency of each char) and left and right pointer to point to left and right child of the node
    4. Remove 2 elements with least frequency from the priority queue amd combine them to create new node with frequency equal to the sum of the 2 removed nodes and char data as null.
       Removed 2 nodes become left and right child of the new node.
    5. Insert the new node back to the priority queue
    6. Repeat steps 4 and 5 until there is only one node left in the priority queue. This node becomes the root of the huffman tree.
    7. Now we have the huffman tree, we can generate the huffman codes for each character by traversing the tree.
       For left edge assign 0 and for right edge assign 1. So, for each character we will have a unique huffman code.
    8. Finally, we can replace each character in the original string with its corresponding huffman code to get the compressed binary string.
    9. Return the compressed binary string to the controller.
    */