const pool = require("../db");

module.exports.createSlot = async (req, res) => {

    try {

        const {
            location_id,
            slot_number,
            vehicle_type,
            status,
            dimensions,
            hourly_price,
            daily_price,
            monthly_price
        } = req.body;

        const result = await pool.query(
            `
            INSERT INTO parking_slots
            (
                location_id,
                slot_number,
                vehicle_type,
                status,
                dimensions,
                hourly_price,
                daily_price,
                monthly_price
            )
            VALUES
            ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING *
            `,
            [
                location_id,
                slot_number,
                vehicle_type,
                status,
                dimensions,
                hourly_price,
                daily_price,
                monthly_price
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};

module.exports.getAllSlots = async (req, res) => {

    try {

        const result = await pool.query(
            `
            SELECT *
            FROM parking_slots
            ORDER BY id
            `
        );

        res.json(result.rows);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};

module.exports.getSlotById = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(
            `
            SELECT *
            FROM parking_slots
            WHERE id = $1
            `,
            [id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "Slot not found"
            });

        }

        res.json(result.rows[0]);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};

module.exports.getSlotsByLocation = async (req, res) => {

    try {

        const { locationId } = req.params;

        const result = await pool.query(
            `
            SELECT *
            FROM parking_slots
            WHERE location_id = $1
            ORDER BY slot_number
            `,
            [locationId]
        );

        res.json(result.rows);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};


module.exports.getAvailableSlots = async (req, res) => {

    try {

        const { locationId } = req.params;

        const result = await pool.query(
            `
            SELECT *
            FROM parking_slots
            WHERE
                location_id = $1
                AND status = 'AVAILABLE'
            ORDER BY slot_number
            `,
            [locationId]
        );

        res.json(result.rows);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};



module.exports.updateSlot = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            slot_number,
            vehicle_type,
            status,
            dimensions,
            hourly_price,
            daily_price,
            monthly_price
        } = req.body;

        const result = await pool.query(
            `
            UPDATE parking_slots
            SET
                slot_number = $1,
                vehicle_type = $2,
                status = $3,
                dimensions = $4,
                hourly_price = $5,
                daily_price = $6,
                monthly_price = $7
            WHERE id = $8
            RETURNING *
            `,
            [
                slot_number,
                vehicle_type,
                status,
                dimensions,
                hourly_price,
                daily_price,
                monthly_price,
                id
            ]
        );

        res.json(result.rows[0]);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};

module.exports.deleteSlot = async (req, res) => {

    try {

        const { id } = req.params;

        await pool.query(
            `
            DELETE FROM parking_slots
            WHERE id = $1
            `,
            [id]
        );

        res.json({
            message: "Slot deleted successfully"
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};


module.exports.updateSlotStatus = async (req, res) => {

    try {

        const { id } = req.params;
        const { status } = req.body;

        const result = await pool.query(
            `
            UPDATE parking_slots
            SET
                status = $1
            WHERE id = $2
            RETURNING *
            `,
            [status, id]
        );

        if(result.rows.length === 0){

            return res.status(404).json({
                message: "Slot not found"
            });

        }

        res.status(200).json({
            message: "Slot status updated successfully",
            slot: result.rows[0]
        });

    } catch(err){

        res.status(500).json({
            error: err.message
        });

    }

};

module.exports.getOccupiedSlots = async (req, res) => {

    try {

        const { locationId } = req.params;

        const result = await pool.query(
            `
            SELECT *
            FROM parking_slots
            WHERE
                location_id = $1
                AND status = 'OCCUPIED'
            ORDER BY slot_number
            `,
            [locationId]
        );

        res.status(200).json(result.rows);

    } catch(err){

        res.status(500).json({
            error: err.message
        });

    }

};


module.exports.getSlotStatistics = async (req, res) => {

    try {

        const { locationId } = req.params;

        const result = await pool.query(
            `
            SELECT

                COUNT(*) AS total_slots,

                COUNT(*) FILTER (
                    WHERE status = 'AVAILABLE'
                ) AS available_slots,

                COUNT(*) FILTER (
                    WHERE status = 'OCCUPIED'
                ) AS occupied_slots,

                COUNT(*) FILTER (
                    WHERE status = 'RESERVED'
                ) AS reserved_slots,

                COUNT(*) FILTER (
                    WHERE status = 'MAINTENANCE'
                ) AS maintenance_slots

            FROM parking_slots

            WHERE location_id = $1
            `,
            [locationId]
        );

        res.status(200).json(result.rows[0]);

    } catch(err){

        res.status(500).json({
            error: err.message
        });

    }

};