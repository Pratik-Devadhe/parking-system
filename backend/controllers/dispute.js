const pool = require('../db.js');
const { createNotificationHelper } = require('./notification.js');

module.exports.getAllDisputes = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT d.*, u.full_name AS user_name, u.email AS user_email, b.total_amount, b.booking_status, pl.name AS location_name
             FROM disputes d
             JOIN users u ON d.user_id = u.id
             JOIN bookings b ON d.booking_id = b.id
             JOIN parking_slots ps ON b.slot_id = ps.id
             JOIN parking_locations pl ON ps.location_id = pl.id
             ORDER BY d.created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports.getDisputesByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await pool.query(
            `SELECT d.*, b.start_time, b.end_time, pl.name AS location_name
             FROM disputes d
             JOIN bookings b ON d.booking_id = b.id
             JOIN parking_slots ps ON b.slot_id = ps.id
             JOIN parking_locations pl ON ps.location_id = pl.id
             WHERE d.user_id = $1
             ORDER BY d.created_at DESC`,
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports.createDispute = async (req, res) => {
    try {
        const { booking_id, user_id, reason, description } = req.body;
        const result = await pool.query(
            `INSERT INTO disputes (booking_id, user_id, reason, description, status)
             VALUES ($1, $2, $3, $4, 'OPEN') RETURNING *`,
            [booking_id, user_id, reason, description || '']
        );
        
        await createNotificationHelper(
            user_id,
            'Dispute Case Opened',
            `Your dispute regarding booking #${booking_id} has been submitted to support.`,
            'DISPUTE_UPDATE'
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports.updateDisputeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const result = await pool.query(
            `UPDATE disputes 
             SET status = $1, 
                 resolved_at = CASE WHEN $1 IN ('RESOLVED', 'REJECTED') THEN NOW() ELSE resolved_at END,
                 updated_at = NOW()
             WHERE id = $2 RETURNING *`,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Dispute not found' });
        }

        const dispute = result.rows[0];
        await createNotificationHelper(
            dispute.user_id,
            `Dispute Update: Case #${dispute.id}`,
            `Status updated to ${status}.`,
            'DISPUTE_UPDATE'
        );

        res.json(dispute);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
