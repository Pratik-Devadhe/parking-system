const pool = require('../db.js');

module.exports.getAllUsers = async (req, res, next) => {
    try {
        const data = await pool.query('SELECT * FROM users');
        res.json(data.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports.createUser = async (req, res, next) => {
    const { full_name, email, phone, password, role, is_verified } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO users (full_name, email, phone, password, role, is_verified)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [full_name, email, phone, password, role, is_verified]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};