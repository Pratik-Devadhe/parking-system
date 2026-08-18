const path = require('path');
require("dotenv").config({ path: path.resolve(__dirname, '.env') });
require("dotenv").config({ path: path.resolve(__dirname, '../.env') });
const { Pool } = require("pg");

// Default connection URI for local PostgreSQL database
const defaultUrl = "postgresql://postgres:pratik@localhost:5432/parking_system";
console.log(process.env.DATABASE_URL);
const connectionString = process.env.DATABASE_URL || defaultUrl;

const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");

const poolConfig = {
    connectionString: connectionString
};

if (!isLocal) {
    poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
    console.error('Unexpected error on idle database client', err);
});

module.exports = pool;