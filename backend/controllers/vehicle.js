const pool = require('../db.js');


module.exports.createVehicle = async (req, res) => {

    try {

        const {
            user_id,
            vehicle_number,
            vehicle_type,
            brand,
            model
        } = req.body;

        const result = await pool.query(
            `
            INSERT INTO vehicles
            (
                user_id,
                vehicle_number,
                vehicle_type,
                brand,
                model
            )
            VALUES
            ($1,$2,$3,$4,$5)
            RETURNING *
            `,
            [
                user_id,
                vehicle_number,
                vehicle_type,
                brand,
                model
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch(err){

        res.status(500).json({
            error: err.message
        });

    }

};

module.exports.getAllVehicles = async (req,res)=>{

    try{

        const result = await pool.query(
            `
            SELECT *
            FROM vehicles
            ORDER BY id
            `
        );

        res.json(result.rows);

    }catch(err){

        res.status(500).json({
            error:err.message
        });

    }

};

module.exports.getVehicleById = async(req,res)=>{

    try{

        const {id}=req.params;

        const result = await pool.query(
            `
            SELECT *
            FROM vehicles
            WHERE id=$1
            `,
            [id]
        );

        res.json(result.rows[0]);

    }catch(err){

        res.status(500).json({
            error:err.message
        });

    }

};

module.exports.getVehiclesByUser = async (req,res) => {
    try {
        const { userId } = req.params;

        const result = await pool.query(
            `
            SELECT *
            FROM vehicles
            WHERE user_id = $1
            `,
            [userId]
        );

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// usually we never delete the vehicle but if you we need to delete its entry from mbooking then we can deletet he vehicle so is not neccesary to delte the vehicle

module.exports.updateVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const { vehicle_number, vehicle_type, brand, model } = req.body;
        const result = await pool.query(
            `UPDATE vehicles SET 
                vehicle_number = COALESCE($1, vehicle_number),
                vehicle_type = COALESCE($2, vehicle_type),
                brand = COALESCE($3, brand),
                model = COALESCE($4, model),
                updated_at = NOW()
             WHERE id = $5 RETURNING *`,
            [vehicle_number, vehicle_type, brand, model, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports.deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM vehicles WHERE id = $1 RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        res.json({ message: 'Vehicle deleted successfully' });
    } catch (err) {
        if (err.code === '23503') {
            return res.status(400).json({
                error: 'Cannot delete vehicle with active booking records.'
            });
        }
        res.status(500).json({ error: err.message });
    }
};


