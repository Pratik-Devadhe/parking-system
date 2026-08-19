const pool = require('../db.js');
const { createNotificationHelper } = require('./notification.js');

// Safeguard parking_sessions table & columns in Neon DB
pool.query(`
    CREATE TABLE IF NOT EXISTS parking_sessions (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
        slot_id INTEGER REFERENCES parking_slots(id) ON DELETE CASCADE,
        entry_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        exit_time TIMESTAMP WITH TIME ZONE,
        parking_fee NUMERIC(10, 2) DEFAULT 0.00,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
`).then(() => {
    return pool.query(`ALTER TABLE parking_sessions ADD COLUMN IF NOT EXISTS parking_fee NUMERIC(10, 2) DEFAULT 0.00;`);
}).catch(() => {});

module.exports.createBooking = async (req, res) => {
    const client = await pool.connect();

    try {
        const {
            user_id,
            vehicle_id,
            slot_id,
            start_time,
            end_time,
            total_amount
        } = req.body;

        await client.query("BEGIN");

        // =====================================================
        // 0. Validate required fields
        // =====================================================
        if (!vehicle_id) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                message: "Vehicle is not registered. Please register your vehicle first in 'My Vehicles'."
            });
        }

        if (!slot_id) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                message: "Parking slot is required."
            });
        }

        // =====================================================
        // 1. Check vehicle registration
        // =====================================================
        const vehRes = await client.query(
            `SELECT id, vehicle_number, vehicle_type
             FROM vehicles
             WHERE id = $1
             AND user_id = $2`,
            [vehicle_id, user_id]
        );

        if (vehRes.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "Vehicle is not registered or does not belong to this user. Please select a registered vehicle."
            });
        }

        const vehicle = vehRes.rows[0];

        // =====================================================
        // 2. Check parking slot and vehicle compatibility
        // =====================================================
        const slotCheck = await client.query(
            `SELECT 
                ps.id,
                ps.slot_number,
                ps.vehicle_type,
                ps.status,
                pl.name AS location_name
             FROM parking_slots ps
             JOIN parking_locations pl 
                ON ps.location_id = pl.id
             WHERE ps.id = $1`,
            [slot_id]
        );

        if (slotCheck.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Parking slot not found."
            });
        }

        const slot = slotCheck.rows[0];

        // =====================================================
        // 2.1 VEHICLE TYPE COMPATIBILITY CHECK
        // =====================================================
        if (vehicle.vehicle_type !== slot.vehicle_type) {
            await client.query("ROLLBACK");

            const vehicleType =
                vehicle.vehicle_type === "TWO_WHEELER"
                    ? "Two Wheeler"
                    : "Four Wheeler";

            const slotType =
                slot.vehicle_type === "TWO_WHEELER"
                    ? "Two Wheeler"
                    : "Four Wheeler";

            return res.status(400).json({
                message: `Vehicle-slot mismatch. Your selected vehicle (${vehicle.vehicle_number}) is a ${vehicleType}, but slot ${slot.slot_number} is available only for ${slotType}s.`,
                error: "VEHICLE_TYPE_MISMATCH",
                vehicle_type: vehicle.vehicle_type,
                slot_vehicle_type: slot.vehicle_type,
                suggestion: `Please select a ${slotType} vehicle or choose another parking slot.`
            });
        }

        // =====================================================
        // 3. Check slot status
        // =====================================================
        if (
            slot.status === "MAINTENANCE" ||
            slot.status === "BLOCKED"
        ) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: `Slot is currently under ${slot.status} and cannot be booked.`
            });
        }

        // =====================================================
        // 4. Check booking timeframe overlap
        // =====================================================
        const availability = await client.query(
            `SELECT id
             FROM bookings
             WHERE slot_id = $1
             AND booking_status IN (
                 'PENDING',
                 'CONFIRMED',
                 'ACTIVE',
                 'BLOCKED'
             )
             AND start_time < $3
             AND end_time > $2`,
            [slot_id, start_time, end_time]
        );

        if (availability.rows.length > 0) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "Slot is already booked or reserved for this time slot.",
                error: "SLOT_NOT_AVAILABLE",
                suggestion: "Please choose another parking slot or select a different time."
            });
        }

        // =====================================================
        // 5. Determine approval mode of location
        // =====================================================
        const locRes = await client.query(
            `SELECT 
                pl.approval_mode,
                pl.name AS location_name,
                pl.owner_id
             FROM parking_slots ps
             JOIN parking_locations pl 
                ON ps.location_id = pl.id
             WHERE ps.id = $1`,
            [slot_id]
        );

        const approvalMode = locRes.rows[0]?.approval_mode || "AUTO";
        const locationName =
            locRes.rows[0]?.location_name || "Parking Garage";
        const ownerId = locRes.rows[0]?.owner_id;

        const initialStatus =
            approvalMode === "MANUAL"
                ? "PENDING"
                : "CONFIRMED";

        // =====================================================
        // 6. Insert booking
        // =====================================================
        const booking = await client.query(
            `INSERT INTO bookings (
                user_id,
                vehicle_id,
                slot_id,
                start_time,
                end_time,
                booking_status,
                total_amount
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                user_id,
                vehicle_id,
                slot_id,
                start_time,
                end_time,
                initialStatus,
                total_amount
            ]
        );

        const newBooking = booking.rows[0];

        // =====================================================
        // 7. Update slot status if instantly confirmed
        // =====================================================
        if (initialStatus === "CONFIRMED") {
            await client.query(
                `UPDATE parking_slots
                 SET status = 'RESERVED',
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $1`,
                [slot_id]
            );
        }

        await client.query("COMMIT");

        // =====================================================
        // 8. Trigger notifications
        // =====================================================
        if (initialStatus === "CONFIRMED") {

            await createNotificationHelper(
                user_id,
                "Booking Confirmed!",
                `Your parking reservation at ${locationName} is confirmed for ${new Date(start_time).toLocaleString()}.`,
                "BOOKING_CONFIRMED"
            );

        } else {

            await createNotificationHelper(
                user_id,
                "Booking Request Submitted",
                `Your reservation request at ${locationName} is pending owner approval.`,
                "REMINDER"
            );

            if (ownerId) {
                await createNotificationHelper(
                    ownerId,
                    "New Booking Approval Needed",
                    `A new booking request #${newBooking.id} is waiting for your review.`,
                    "REMINDER"
                );
            }
        }

        // =====================================================
        // 9. Response
        // =====================================================
        return res.status(201).json({
            message:
                initialStatus === "CONFIRMED"
                    ? "Booking Created Successfully"
                    : "Booking Request Submitted for Owner Approval",

            booking: newBooking
        });

    } catch (err) {

        await client.query("ROLLBACK");

        // Handle PostgreSQL exclusion constraint
        // in case two requests attempt to book the same slot
        // simultaneously.
        if (err.code === "23P01") {
            return res.status(409).json({
                message: "This parking slot was just booked for the selected time. Please choose another slot or time.",
                error: "BOOKING_OVERLAP"
            });
        }

        console.error("Create booking error:", err);

        return res.status(500).json({
            error: "Failed to create booking.",
            message: err.message
        });

    } finally {
        client.release();
    }
};
module.exports.checkAvailability = async (req, res) => {
    try {
        const { slot_id, start_time, end_time } = req.body;
        const result = await pool.query(
            `SELECT * FROM bookings
             WHERE slot_id = $1
             AND booking_status IN ('PENDING','CONFIRMED','ACTIVE','BLOCKED')
             AND start_time < $3
             AND end_time > $2`,
            [slot_id, start_time, end_time]
        );

        if (result.rows.length > 0) {
            return res.status(400).json({ available: false, message: "Slot is not available." });
        }

        res.json({ available: true, message: "Slot is available." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports.getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT b.*, u.full_name, u.email, u.phone, v.vehicle_number, ps.slot_number, pl.name AS parking_name, pl.address
             FROM bookings b
             JOIN users u ON b.user_id = u.id
             JOIN vehicles v ON b.vehicle_id = v.id
             JOIN parking_slots ps ON b.slot_id = ps.id
             JOIN parking_locations pl ON ps.location_id = pl.id
             WHERE b.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports.getBookingsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await pool.query(
            `SELECT b.*, v.vehicle_number, ps.slot_number, pl.name AS parking_name, pl.address
             FROM bookings b
             JOIN vehicles v ON b.vehicle_id = v.id
             JOIN parking_slots ps ON b.slot_id = ps.id
             JOIN parking_locations pl ON ps.location_id = pl.id
             WHERE b.user_id = $1
             ORDER BY b.created_at DESC`,
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports.getBookingsByOwner = async (req, res) => {
    try {
        const { ownerId } = req.params;
        const result = await pool.query(
            `SELECT b.*, u.full_name AS driver_name, u.phone AS driver_phone, u.email AS driver_email,
                    v.vehicle_number, ps.slot_number, pl.name AS parking_name
             FROM bookings b
             JOIN users u ON b.user_id = u.id
             JOIN vehicles v ON b.vehicle_id = v.id
             JOIN parking_slots ps ON b.slot_id = ps.id
             JOIN parking_locations pl ON ps.location_id = pl.id
             WHERE pl.owner_id = $1
             ORDER BY b.created_at DESC`,
            [ownerId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports.getAllBookings = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT b.*, u.full_name, v.vehicle_number, ps.slot_number, pl.name AS parking_location
             FROM bookings b
             JOIN users u ON u.id = b.user_id
             JOIN vehicles v ON v.id = b.vehicle_id
             JOIN parking_slots ps ON ps.id = b.slot_id
             JOIN parking_locations pl ON pl.id = ps.location_id
             ORDER BY b.created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports.approveBooking = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        await client.query("BEGIN");

        const checkRes = await client.query(`SELECT * FROM bookings WHERE id = $1 FOR UPDATE`, [id]);
        if (checkRes.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Booking not found" });
        }
        
        if (checkRes.rows[0].booking_status !== 'PENDING') {
            await client.query("ROLLBACK");
            return res.status(400).json({ message: "Only PENDING bookings can be approved" });
        }

        const result = await client.query(
            `UPDATE bookings SET booking_status = 'CONFIRMED', updated_at = NOW() WHERE id = $1 RETURNING *`,
            [id]
        );

        const b = result.rows[0];
        await client.query(`UPDATE parking_slots SET status = 'RESERVED' WHERE id = $1`, [b.slot_id]);

        await client.query("COMMIT");

        await createNotificationHelper(
            b.user_id,
            'Booking Approved by Owner!',
            `Your booking request #${b.id} has been approved and confirmed.`,
            'BOOKING_CONFIRMED'
        );

        res.json({ message: "Booking approved successfully", booking: b });
    } catch (err) {
        await client.query("ROLLBACK");
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

module.exports.rejectBooking = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        await client.query("BEGIN");

        const checkRes = await client.query(`SELECT * FROM bookings WHERE id = $1 FOR UPDATE`, [id]);
        if (checkRes.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Booking not found" });
        }
        
        if (checkRes.rows[0].booking_status !== 'PENDING') {
            await client.query("ROLLBACK");
            return res.status(400).json({ message: "Only PENDING bookings can be declined" });
        }

        const result = await client.query(
            `UPDATE bookings SET booking_status = 'CANCELLED', cancelled_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *`,
            [id]
        );

        const b = result.rows[0];
        await client.query("COMMIT");

        await createNotificationHelper(
            b.user_id,
            'Booking Request Declined',
            `Your booking request #${b.id} was declined by the property owner.`,
            'BOOKING_CANCELLED'
        );

        res.json({ message: "Booking request declined", booking: b });
    } catch (err) {
        await client.query("ROLLBACK");
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

module.exports.blockSlotTimeframe = async (req, res) => {
    const client = await pool.connect();
    try {
        const { slot_id, start_time, end_time, owner_id } = req.body;

        await client.query("BEGIN");

        const availability = await client.query(
            `SELECT id FROM bookings
             WHERE slot_id = $1
             AND booking_status IN ('PENDING', 'CONFIRMED', 'ACTIVE', 'BLOCKED')
             AND start_time < $3 AND end_time > $2`,
            [slot_id, start_time, end_time]
        );

        if (availability.rows.length > 0) {
            await client.query("ROLLBACK");
            return res.status(400).json({ message: "Cannot block timeframe: Slot already has active bookings during this window." });
        }

        // Get dummy/owner vehicle or first vehicle
        let vId = 1;
        const vRes = await client.query(`SELECT id FROM vehicles LIMIT 1`);
        if (vRes.rows.length > 0) vId = vRes.rows[0].id;

        const targetUserId = req.user?.id || owner_id;

        const result = await client.query(
            `INSERT INTO bookings (user_id, vehicle_id, slot_id, start_time, end_time, booking_status, total_amount)
             VALUES ($1, $2, $3, $4, $5, 'BLOCKED', 0.00) RETURNING *`,
            [targetUserId, vId, slot_id, start_time, end_time]
        );

        await client.query("COMMIT");
        res.status(201).json({ message: "Slot timeframe blocked successfully", blocked_slot: result.rows[0] });

    } catch (err) {
        await client.query("ROLLBACK");
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

module.exports.getOwnerEarnings = async (req, res) => {
    try {
        const { ownerId } = req.params;

        const result = await pool.query(
            `SELECT 
                COALESCE(SUM(b.total_amount), 0) AS total_earnings,
                COUNT(b.id) AS total_bookings,
                COUNT(b.id) FILTER (WHERE b.booking_status = 'COMPLETED') AS completed_bookings,
                COUNT(b.id) FILTER (WHERE b.booking_status = 'PENDING') AS pending_approvals
             FROM bookings b
             JOIN parking_slots ps ON b.slot_id = ps.id
             JOIN parking_locations pl ON ps.location_id = pl.id
             WHERE pl.owner_id = $1 AND b.booking_status IN ('CONFIRMED', 'COMPLETED')`,
            [ownerId]
        );

        const breakdown = await pool.query(
            `SELECT pl.id AS location_id, pl.name AS location_name, COALESCE(SUM(b.total_amount), 0) AS revenue
             FROM parking_locations pl
             LEFT JOIN parking_slots ps ON ps.location_id = pl.id
             LEFT JOIN bookings b ON b.slot_id = ps.id AND b.booking_status IN ('CONFIRMED', 'COMPLETED')
             WHERE pl.owner_id = $1
             GROUP BY pl.id, pl.name`,
            [ownerId]
        );

        res.json({
            stats: result.rows[0],
            location_breakdown: breakdown.rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports.cancelBooking = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { cancelled_by } = req.body;

        await client.query("BEGIN");
        
        const checkRes = await client.query(`SELECT * FROM bookings WHERE id = $1 FOR UPDATE`, [id]);
        if (checkRes.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Booking not found" });
        }
        if (['CANCELLED', 'COMPLETED', 'ACTIVE'].includes(checkRes.rows[0].booking_status)) {
            await client.query("ROLLBACK");
            return res.status(400).json({ message: `Cannot cancel a booking that is currently ${checkRes.rows[0].booking_status}` });
        }

        const booking = await client.query(
            `UPDATE bookings SET booking_status = 'CANCELLED', cancelled_at = NOW(), cancelled_by = $1 WHERE id = $2 RETURNING *`,
            [cancelled_by || 1, id]
        );

        await client.query(`UPDATE parking_slots SET status = 'AVAILABLE' WHERE id = $1`, [booking.rows[0].slot_id]);

        await client.query("COMMIT");

        res.json({ message: "Booking cancelled successfully" });
    } catch (err) {
        await client.query("ROLLBACK");
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

module.exports.checkIn = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        await client.query("BEGIN");

        const bookingResult = await client.query(`SELECT * FROM bookings WHERE id = $1 FOR UPDATE`, [id]);
        if (bookingResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Booking not found" });
        }

        const booking = bookingResult.rows[0];
        if (booking.booking_status === "CANCELLED" || booking.booking_status === "COMPLETED") {
            await client.query("ROLLBACK");
            return res.status(400).json({ message: `Cannot check in. Booking is already ${booking.booking_status}.` });
        }

        await client.query(`UPDATE bookings SET booking_status = 'ACTIVE' WHERE id = $1`, [id]);
        await client.query(`UPDATE parking_slots SET status = 'OCCUPIED' WHERE id = $1`, [booking.slot_id]);

        let session;
        const existingSession = await client.query(`SELECT * FROM parking_sessions WHERE booking_id = $1 AND exit_time IS NULL`, [id]);
        if (existingSession.rows.length > 0) {
            session = existingSession;
        } else {
            session = await client.query(
                `INSERT INTO parking_sessions (booking_id, slot_id, entry_time) VALUES ($1, $2, NOW()) RETURNING *`,
                [booking.id, booking.slot_id]
            );
        }

        await client.query("COMMIT");

        res.status(200).json({
            message: "Vehicle checked in successfully. Gate barrier unlocked!",
            session: session.rows[0]
        });
    } catch (err) {
        await client.query("ROLLBACK");
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

module.exports.checkOut = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        await client.query("BEGIN");

        const bookingResult = await client.query(`SELECT * FROM bookings WHERE id = $1 FOR UPDATE`, [id]);
        if (bookingResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        const bookingRow = bookingResult.rows[0];
        if (bookingRow.booking_status === 'COMPLETED' || bookingRow.booking_status === 'CANCELLED') {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: `Booking is already ${bookingRow.booking_status}.` });
        }

        let sessionCheck = await client.query(`SELECT * FROM parking_sessions WHERE booking_id = $1 AND exit_time IS NULL FOR UPDATE`, [id]);
        if (sessionCheck.rows.length === 0) {
            sessionCheck = await client.query(
                `INSERT INTO parking_sessions (booking_id, slot_id, entry_time) VALUES ($1, $2, $3) RETURNING *`,
                [bookingRow.id, bookingRow.slot_id, bookingRow.start_time || new Date()]
            );
        }

        const session = await client.query(
            `UPDATE parking_sessions SET exit_time = NOW() WHERE booking_id = $1 AND exit_time IS NULL RETURNING *`,
            [id]
        );

        const entry = new Date(session.rows[0]?.entry_time || bookingRow.start_time || new Date());
        const exit = new Date(session.rows[0]?.exit_time || new Date());
        const hours = Math.max(1, Math.ceil((exit - entry) / (1000 * 60 * 60)));

        const slot = await client.query(`SELECT hourly_price FROM parking_slots WHERE id = $1`, [bookingRow.slot_id]);
        const hourlyPrice = slot.rows[0]?.hourly_price || 10;
        const fee = (hours * hourlyPrice).toFixed(2);

        await client.query(`UPDATE parking_sessions SET parking_fee = $1 WHERE booking_id = $2`, [fee, id]);
        await client.query(`UPDATE bookings SET booking_status = 'COMPLETED', total_amount = $1 WHERE id = $2`, [fee, id]);
        await client.query(`UPDATE parking_slots SET status = 'AVAILABLE' WHERE id = $1`, [bookingRow.slot_id]);

        await client.query("COMMIT");

        res.json({
            parking_fee: fee,
            hours: hours,
            message: "Checkout successful. Gate barrier unlocked!"
        });
    } catch (err) {
        await client.query("ROLLBACK");
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};
