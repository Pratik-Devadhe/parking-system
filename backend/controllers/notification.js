const pool = require('../db.js');

// Create a notification helper
async function createNotificationHelper(userId, title, message, notificationType) {
    try {
        await pool.query(
            `INSERT INTO notifications (user_id, title, message, notification_type, sent_at)
             VALUES ($1, $2, $3, $4, NOW())`,
            [userId, title, message, notificationType]
        );
    } catch (err) {
        // Notification creation error ignored silently to prevent breaking main flows
    }
}

module.exports.createNotificationHelper = createNotificationHelper;

module.exports.getNotificationsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await pool.query(
            `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING *`,
            [id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports.markAllAsRead = async (req, res) => {
    try {
        const { userId } = req.params;
        await pool.query(
            `UPDATE notifications SET is_read = TRUE WHERE user_id = $1`,
            [userId]
        );
        res.json({ message: 'All notifications marked as read.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports.createNotification = async (req, res) => {
    try {
        const { user_id, title, message, notification_type } = req.body;
        const result = await pool.query(
            `INSERT INTO notifications (user_id, title, message, notification_type, sent_at)
             VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
            [user_id, title, message, notification_type || 'BOOKING_CONFIRMED']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
