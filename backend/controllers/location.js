const pool = require('../db.js');

module.exports.getAllLocation =  async (req, res)=> {

    try {
        const data = await pool.query('SELECT * FROM parking_locations');
        res.json(data.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


module.exports.createLocation = async (req , res) => {

    const {owner_id, name, address, longitude, latitude, total_slots} = req.body;

    try{
        const result = await pool.query(
            `INSERT INTO parking_locations (owner_id, name, address, location, total_slots)
             VALUES ($1 , $2 , $3, ST_SetSRID(ST_MakePoint($4, $5), 4326)::geography, $6) RETURNING *`,
             [owner_id, name, address, longitude, latitude, total_slots]
        );

        res.status(201).json(result.rows[0]);

    }catch(err) {
        res.status(500).json({
            error : err.message
        });
    } 
};

module.exports.deleteLocation = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM parking_locations WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Location not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports.updateLocation = async (req, res) => {
    const id = req.params.id;
    const {
        name,
        address,
        longitude,
        latitude,
        total_slots,
        approval_mode,
        is_verified,
        operating_hours_start,
        operating_hours_end,
        description
    } = req.body;

    const updates = [];
    const values = [];

    if (name !== undefined) {
        values.push(name);
        updates.push(`name = $${values.length}`);
    }
    if (address !== undefined) {
        values.push(address);
        updates.push(`address = $${values.length}`);
    }
    if (longitude !== undefined && latitude !== undefined) {
        values.push(longitude, latitude);
        updates.push(`location = ST_SetSRID(ST_MakePoint($${values.length - 1}, $${values.length}), 4326)::geography`);
    }
    if (total_slots !== undefined) {
        values.push(total_slots);
        updates.push(`total_slots = $${values.length}`);
    }
    if (approval_mode !== undefined) {
        values.push(approval_mode);
        updates.push(`approval_mode = $${values.length}`);
    }
    if (is_verified !== undefined) {
        values.push(is_verified);
        updates.push(`is_verified = $${values.length}`);
    }
    if (operating_hours_start !== undefined) {
        values.push(operating_hours_start);
        updates.push(`operating_hours_start = $${values.length}`);
    }
    if (operating_hours_end !== undefined) {
        values.push(operating_hours_end);
        updates.push(`operating_hours_end = $${values.length}`);
    }
    if (description !== undefined) {
        values.push(description);
        updates.push(`description = $${values.length}`);
    }

    if (updates.length === 0) {
        return res.status(400).json({ message: 'No valid fields provided to update.' });
    }

    values.push(id);

    try {
        const result = await pool.query(
            `UPDATE parking_locations SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Location not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};