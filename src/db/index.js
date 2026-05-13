const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbClient = process.env.DB_CLIENT || 'sqlite';
let pool; // For MySQL
let sqliteDb; // For SQLite

const initDb = async () => {
    if (dbClient === 'mysql') {
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Create tables for MySQL
        const connection = await pool.getConnection();
        try {
            await connection.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    profile_path TEXT NULL,
                    name_id VARCHAR(255) NOT NULL UNIQUE,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    pwd_hash VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                );
            `);
            await connection.query(`
                CREATE TABLE IF NOT EXISTS sessions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    token TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                );
            `);
            // Add other schema creations here (stores, products, transactions)
        } finally {
            connection.release();
        }

    } else {
        // Initialize SQLite
        const dbPath = process.env.SQLITE_FILE_PATH || path.join(__dirname, '../../shopping_db.sqlite');
        sqliteDb = new sqlite3.Database(dbPath);

        return new Promise((resolve, reject) => {
            sqliteDb.serialize(() => {
                sqliteDb.run(`
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        profile_path TEXT,
                        name_id TEXT NOT NULL UNIQUE,
                        email TEXT NOT NULL UNIQUE,
                        pwd_hash TEXT NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    );
                `);
                sqliteDb.run(`
                    CREATE TABLE IF NOT EXISTS sessions (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER NOT NULL,
                        token TEXT NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                    );
                `, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    }
};

// Unified Query Execution
const executeQuery = async (queryStr, params = []) => {
    if (dbClient === 'mysql') {
        const [rows] = await pool.query(queryStr, params);
        return rows;
    } else {
        return new Promise((resolve, reject) => {
            // Replace MySQL placeholder syntax if needed, though '?' is compatible
            sqliteDb.all(queryStr, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
};

const executeInsert = async (queryStr, params = []) => {
    if (dbClient === 'mysql') {
        const [result] = await pool.query(queryStr, params);
        return result.insertId;
    } else {
        return new Promise((resolve, reject) => {
            sqliteDb.run(queryStr, params, function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });
    }
};

module.exports = {
    initDb,
    executeQuery,
    executeInsert
};
