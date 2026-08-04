const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function initializeDatabase() {
    try {
        const sql = fs.readFileSync(
            path.join(__dirname, 'sql', 'schema.sql'),
            'utf8'
        );

        await pool.query(sql);

        console.log('Database schema created successfully!');
    } catch (error) {
        console.error('Error creating schema:', error);
    } finally {
        await pool.end();
    }
}

initializeDatabase();