const pool = require('../db.js');


module.exports.getAllSessions = async (req , res , next) => {

    try{

        const data = await pool.query(`SELECT * FROM parking_sessions`);

        res.status(200).json(data.rows);

    }catch(err){
        res.status(500).json({ error : err.message});
    }
};
