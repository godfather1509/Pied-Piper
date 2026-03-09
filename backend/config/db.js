import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const dbName = process.env.DB_NAME || 'compressor_file_db';

export const sequelize = new Sequelize(
  dbName,
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'root',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false, // Set to console.log to see SQL queries
  }
);

export const connectionDB = async () => {
  try {
    // 1. Connect temporarily without selecting a database just to ensure it exists
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root'
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.end();

    // 2. Authenticate Sequelize with the database
    await sequelize.authenticate();
    console.log('Connection to MySQL has been established successfully via Sequelize.');

    // 3. Sync all models with the database (creates tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('Database models synced successfully.');

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};