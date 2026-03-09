import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

export const db = {
  pool: null,
  query: async (...args) => {
    if (!db.pool) throw new Error("Database not initialized");
    return db.pool.query(...args);
  }
};

export const connectionDB = async () => {
  try {
    // 1. Connect without selecting database to ensure it exists
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root'
    });

    const dbName = process.env.DB_NAME || 'compressor_file_db';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.end();

    // 2. Initialize the pool with the target database
    db.pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: dbName,
      connectionLimit: 10
    });

    const poolConnection = await db.pool.getConnection();
    console.log(`Connected to MySQL as ID ${poolConnection.threadId}`);
    poolConnection.release();

    // 3. Ensure the 'files' table exists for uploaded text files
    await db.pool.query(`
      CREATE TABLE IF NOT EXISTS files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        original_name VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        path VARCHAR(255) NOT NULL,
        size INT NOT NULL,
        compressed_path VARCHAR(255),
        compressed_size INT,
        upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add columns if they missed the initial creation (ignore error if they already exist)
    try { await db.pool.query(`ALTER TABLE files ADD COLUMN compressed_path VARCHAR(255)`); } catch (e) { }
    try { await db.pool.query(`ALTER TABLE files ADD COLUMN compressed_size INT`); } catch (e) { }

    console.log('Database and Files table ensured in MySQL.');
  } catch (error) {
    console.error('Error connecting to MySQL: ', error);
  }
};