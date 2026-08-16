const pool = require('../db.js');

module.exports.getAllLocation = async (req, res) => {
    try {
        const data = await pool.query(`
            SELECT pl.*, 
                   COALESCE(img.image_url, 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=1000') AS primary_image
            FROM parking_locations pl
            LEFT JOIN parking_location_images img ON pl.id = img.location_id AND img.is_primary = TRUE
            ORDER BY pl.id ASC
        `);
        res.json(data.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports.getLocationById = async (req , res ) =>{
    try{

        const {id} = req.params;

        const data = await pool.query(`SELECT * FROM parking_locations WHERE id = $1` , [id]);

        res.json(data.rows[0]);

    }catch(err){
        res.send(`erroe : ${err}`);
    }
}


module.exports.getLocationsByOwner = async (req, res) => {
    const { ownerId } = req.params;
    try {
        const data = await pool.query(
            `SELECT pl.*, 
                    COALESCE(img.image_url, 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=1000') AS primary_image
             FROM parking_locations pl
             LEFT JOIN parking_location_images img ON pl.id = img.location_id AND img.is_primary = TRUE
             WHERE pl.owner_id = $1
             ORDER BY pl.id ASC`,
            [ownerId]
        );
        res.json(data.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports.searchLocations = async (req, res) => {
    const { query, vehicle_type, start_time, end_time, lat, lng } = req.body;

    try {
        let sql = `
            SELECT DISTINCT pl.*, 
                   COALESCE(img.image_url, 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=1000') AS primary_image,
                   (SELECT COUNT(*) FROM parking_slots ps WHERE ps.location_id = pl.id AND ps.status = 'AVAILABLE') AS available_slots_count
            FROM parking_locations pl
            LEFT JOIN parking_location_images img ON pl.id = img.location_id AND img.is_primary = TRUE
            LEFT JOIN parking_slots ps ON ps.location_id = pl.id
            WHERE 1=1
        `;

        const params = [];

        if (query && query.trim() !== '') {
            params.push(`%${query.trim()}%`);
            sql += ` AND (pl.name ILIKE $${params.length} OR pl.address ILIKE $${params.length})`;
        }

        if (vehicle_type) {
            params.push(vehicle_type);
            sql += ` AND ps.vehicle_type = $${params.length}`;
        }

        sql += ` ORDER BY pl.id ASC`;

        const data = await pool.query(sql, params);
        res.json(data.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports.createLocation = async (req, res) => {
    const { owner_id, name, address, longitude, latitude, total_slots, approval_mode, operating_hours_start, operating_hours_end, description, image_url } = req.body;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const lngVal = Number(longitude) || -74.0060;
        const latVal = Number(latitude) || 40.7128;

        const result = await client.query(
            `INSERT INTO parking_locations (owner_id, name, address, location, total_slots, approval_mode, operating_hours_start, operating_hours_end, description)
             VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326)::geography, $6, COALESCE($7, 'AUTO'), COALESCE($8, '00:00:00')::TIME, COALESCE($9, '23:59:59')::TIME, $10) 
             RETURNING *`,
            [owner_id || 3, name, address, lngVal, latVal, total_slots || 10, approval_mode, operating_hours_start , operating_hours_end , description || '']
        );

        const newLoc = result.rows[0];

        if (image_url) {
            await client.query(
                `INSERT INTO parking_location_images (location_id, image_url, is_primary) VALUES ($1, $2, TRUE)`,
                [newLoc.id, image_url]
            );
        }

        await client.query('COMMIT');
        res.status(201).json(newLoc);
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
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

module.exports.verifyLocation = async (req, res) => {
    const { id } = req.params;
    const { is_verified } = req.body;
    try {
        const result = await pool.query(
            `UPDATE parking_locations SET is_verified = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
            [is_verified, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Location not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};