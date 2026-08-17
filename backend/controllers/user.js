const pool = require('../db.js');
const { generateToken } = require('../middleware/auth.js');

module.exports.getAllUsers = async (req, res) => {
    try {
        const data = await pool.query('SELECT id, full_name, email, phone, role, is_verified, status, created_at FROM users ORDER BY id ASC');
        res.json(data.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports.createUser = async (req, res) => {
    const { full_name, email, phone, password, role, is_verified, vehicle_number, vehicle_type, brand, model } = req.body;

    if (!full_name || !email || !password) {
        return res.status(400).json({ message: 'Full name, email, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanName = full_name.trim();

    const requestedRole = (role || 'DRIVER').toUpperCase();
    if (requestedRole === 'ADMIN') {
        return res.status(400).json({ message: 'Registration as ADMIN is not allowed. System Administrator is a restricted single account.' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO users (full_name, email, phone, password, role, is_verified)
             VALUES ($1, $2, $3, $4, $5, COALESCE($6, FALSE)) RETURNING id, full_name, email, phone, role, is_verified, status, created_at`,
            [cleanName, cleanEmail, phone ? phone.trim() : null, cleanPassword, requestedRole, is_verified]
        );
        const user = result.rows[0];

        if (requestedRole === 'DRIVER' && vehicle_number) {
            try {
                await pool.query(
                    `INSERT INTO vehicles (user_id, vehicle_number, vehicle_type, brand, model)
                     VALUES ($1, $2, COALESCE($3, 'FOUR_WHEELER'), $4, $5)
                     ON CONFLICT (vehicle_number) DO NOTHING`,
                    [user.id, vehicle_number.trim(), vehicle_type || 'FOUR_WHEELER', brand || '', model || '']
                );
            } catch (vErr) {
                console.error('Auto-creating vehicle error on signup:', vErr);
            }
        }

        const token = generateToken(user);
        res.status(201).json({ message: 'User registered successfully', token, user });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ message: 'An account with this email address already exists.' });
        }
        res.status(500).json({ error: err.message });
    }
};

module.exports.loginUser = async (req, res) => {
    const { email, password, role: requestedRole } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
        const result = await pool.query(
            `SELECT id, full_name, email, phone, role, is_verified, status, password FROM users WHERE LOWER(email) = $1`,
            [cleanEmail]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = result.rows[0];
        if (user.password !== cleanPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (user.status === 'SUSPENDED') {
            return res.status(403).json({ message: 'Account is suspended. Please contact support.' });
        }

        if (requestedRole && user.role.toUpperCase() !== requestedRole.toUpperCase()) {
            return res.status(403).json({ message: `Role mismatch: This account is registered as ${user.role}, not ${requestedRole}.` });
        }

        delete user.password;
        const token = generateToken(user);
        res.json({
            message: 'Login successful',
            token,
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