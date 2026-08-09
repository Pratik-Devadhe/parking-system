const pool = require('../db.js');

module.exports.getSettings = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM system_settings ORDER BY setting_key');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports.updateSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const { value, description } = req.body;
        
        const result = await pool.query(
            `INSERT INTO system_settings (setting_key, value, description, updated_at)
             VALUES ($1, $2, $3, NOW())
             ON CONFLICT (setting_key) 
             DO UPDATE SET value = EXCLUDED.value, description = COALESCE(EXCLUDED.description, system_settings.description), updated_at = NOW()
             RETURNING *`,
            [key, value, description || '']
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports.getAdminStats = async (req, res) => {
    try {
        const [revenueRes, bookingsRes, sessionsRes, usersRes, locationsRes, disputesRes] = await Promise.all([
            pool.query(`SELECT COALESCE(SUM(total_amount), 0) AS total_revenue FROM bookings WHERE booking_status IN ('CONFIRMED', 'COMPLETED')`),
            pool.query(`SELECT COUNT(*) AS total_bookings, COUNT(*) FILTER (WHERE booking_status = 'PENDING') AS pending_bookings FROM bookings`),
            pool.query(`SELECT COUNT(*) AS active_sessions FROM parking_sessions WHERE exit_time IS NULL`),
            pool.query(`SELECT COUNT(*) AS total_users, COUNT(*) FILTER (WHERE role = 'OWNER') AS owner_count, COUNT(*) FILTER (WHERE role = 'DRIVER') AS driver_count FROM users`),
            pool.query(`SELECT COUNT(*) AS total_locations, COUNT(*) FILTER (WHERE is_verified = TRUE) AS verified_locations FROM parking_locations`),
            pool.query(`SELECT COUNT(*) AS open_disputes FROM disputes WHERE status = 'OPEN'`)
        ]);

        res.json({
            total_revenue: parseFloat(revenueRes.rows[0].total_revenue),
            total_bookings: parseInt(bookingsRes.rows[0].total_bookings),
            pending_bookings: parseInt(bookingsRes.rows[0].pending_bookings),
            active_sessions: parseInt(sessionsRes.rows[0].active_sessions),
            total_users: parseInt(usersRes.rows[0].total_users),
            owner_count: parseInt(usersRes.rows[0].owner_count),
            driver_count: parseInt(usersRes.rows[0].driver_count),
            total_locations: parseInt(locationsRes.rows[0].total_locations),
            verified_locations: parseInt(locationsRes.rows[0].verified_locations),
            open_disputes: parseInt(disputesRes.rows[0].open_disputes)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
