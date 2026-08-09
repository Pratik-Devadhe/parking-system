const pool = require('../db.js');

module.exports.getAllUsers = async (req, res) => {
    try {
        const data = await pool.query('SELECT id, full_name, email, phone, role, is_verified, status, created_at FROM users ORDER BY id ASC');
        res.json(data.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports.createUser = async (req, res) => {
    const { full_name, email, phone, password, role, is_verified } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO users (full_name, email, phone, password, role, is_verified)
             VALUES ($1, $2, $3, $4, $5, COALESCE($6, FALSE)) RETURNING id, full_name, email, phone, role, is_verified, status, created_at`,
            [full_name, email, phone, password, role || 'DRIVER', is_verified]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query(
            `SELECT id, full_name, email, phone, role, is_verified, status, password FROM users WHERE email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = result.rows[0];
        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (user.status === 'SUSPENDED') {
            return res.status(403).json({ message: 'Account is suspended. Please contact support.' });
        }

        delete user.password;
        res.json({
            message: 'Login successful',
            user: user
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports.getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT id, full_name, email, phone, role, is_verified, status, created_at FROM users WHERE id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports.updateUserStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const result = await pool.query(
            `UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, full_name, email, phone, role, is_verified, status`,
            [status, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports.verifyUser = async (req, res) => {
    const { id } = req.params;
    const { is_verified } = req.body;
    try {
        const result = await pool.query(
            `UPDATE users SET is_verified = $1, updated_at = NOW() WHERE id = $2 RETURNING id, full_name, email, phone, role, is_verified, status`,
            [is_verified, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { full_name, email, phone, role, status } = req.body;
    try {
        const result = await pool.query(
            `UPDATE users SET 
                full_name = COALESCE($1, full_name),
                email = COALESCE($2, email),
                phone = COALESCE($3, phone),
                role = COALESCE($4, role),
                status = COALESCE($5, status),
                updated_at = NOW()
             WHERE id = $6 RETURNING id, full_name, email, phone, role, is_verified, status`,
            [full_name, email, phone, role, status, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, full_name, email', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully', user: result.rows[0] });
    } catch (err) {
        if (err.code === '23503') {
            return res.status(400).json({ error: 'Cannot delete user with associated bookings, vehicles, or locations.' });
        }
        res.status(500).json({ error: err.message });
    }
};