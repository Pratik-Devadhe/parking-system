const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'parking_system',
    password: 'pratik',
    port: 5432
});

module.exports = pool;