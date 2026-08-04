const pool = require('../db.js');

module.exports.createBooking = async (req,res)=> {

    const client = await pool.connect();

    try{

        const{

            user_id,
            vehicle_id,
            slot_id,
            start_time,
            end_time,
            total_amount

        } = req.body;

        await client.query("BEGIN");

        const availability = await client.query(

            `
            SELECT id
            FROM bookings
            WHERE slot_id=$1
            AND booking_status IN
            ('PENDING','CONFIRMED','BLOCKED')
            AND start_time < $3
            AND end_time > $2
            `,

            [
                slot_id,
                start_time,
                end_time
            ]

        );

        if(availability.rows.length){

            await client.query("ROLLBACK");

            return res.status(400).json({

                message:"Slot already booked."

            });

        }

        const booking = await client.query(

            `
            INSERT INTO bookings
            (

                user_id,
                vehicle_id,
                slot_id,
                start_time,
                end_time,
                booking_status,
                total_amount

            )

            VALUES

            ($1,$2,$3,$4,$5,'CONFIRMED',$6)

            RETURNING *

            `,

            [

                user_id,
                vehicle_id,
                slot_id,
                start_time,
                end_time,
                total_amount

            ]

        );

        await client.query(

            `
            UPDATE parking_slots
            SET status='RESERVED'
            WHERE id=$1
            `,

            [slot_id]

        );

        await client.query("COMMIT");

        res.status(201).json({

            message:"Booking Created Successfully",

            booking:booking.rows[0]

        });

    }catch(err){

        await client.query("ROLLBACK");

        res.status(500).json({

            error:err.message

        });

    }finally{

        client.release();

    }

};


module.exports.checkAvailability = async (req, res) => {

    try {

        const {
            slot_id,
            start_time,
            end_time
        } = req.body;

        const result = await pool.query(

            `
            SELECT *
            FROM bookings
            WHERE slot_id = $1
            AND booking_status IN ('PENDING','CONFIRMED','BLOCKED')
            AND start_time < $3
            AND end_time > $2
            `,

            [
                slot_id,
                start_time,
                end_time
            ]

        );

        if(result.rows.length > 0){

            return res.status(400).json({
                available:false,
                message:"Slot is not available."
            });

        }

        res.json({
            available:true,
            message:"Slot is available."
        });

    } catch(err){

        res.status(500).json({
            error:err.message
        });

    }

};


module.exports.getBookingById = async(req,res)=>{

    try{

        const{id}=req.params;

        const result = await pool.query(

            `
            SELECT

            b.*,

            u.full_name,

            v.vehicle_number,

            ps.slot_number,

            pl.name AS parking_name

            FROM bookings b

            JOIN users u
            ON b.user_id=u.id

            JOIN vehicles v
            ON b.vehicle_id=v.id

            JOIN parking_slots ps
            ON b.slot_id=ps.id

            JOIN parking_locations pl
            ON ps.location_id=pl.id

            WHERE b.id=$1

            `,

            [id]

        );

        if(result.rows.length==0){

            return res.status(404).json({

                message:"Booking not found"

            });

        }

        res.json(result.rows[0]);

    }catch(err){

        res.status(500).json({

            error:err.message

        });

    }

};


module.exports.getBookingsByUser = async(req,res)=>{

    try{

        const{userId}=req.params;

        const result = await pool.query(

            `
            SELECT

            b.*,

            v.vehicle_number,

            ps.slot_number,

            pl.name AS parking_name

            FROM bookings b

            JOIN vehicles v
            ON b.vehicle_id=v.id

            JOIN parking_slots ps
            ON b.slot_id=ps.id

            JOIN parking_locations pl
            ON ps.location_id=pl.id

            WHERE b.user_id=$1

            ORDER BY b.created_at DESC

            `,

            [userId]

        );

        res.json(result.rows);

    }catch(err){

        res.status(500).json({

            error:err.message

        });

    }

};

module.exports.getAllBookings = async (req,res)=>{

    try{

        const result = await pool.query(

            `
            SELECT

                b.*,
                u.full_name,
                v.vehicle_number,
                ps.slot_number,
                pl.name AS parking_location

            FROM bookings b

            JOIN users u
            ON u.id=b.user_id

            JOIN vehicles v
            ON v.id=b.vehicle_id

            JOIN parking_slots ps
            ON ps.id=b.slot_id

            JOIN parking_locations pl
            ON pl.id=ps.location_id

            ORDER BY b.created_at DESC
            `

        );

        res.json(result.rows);

    }catch(err){

        res.status(500).json({
            error:err.message
        });

    }

};


module.exports.cancelBooking = async(req,res)=>{

    const client = await pool.connect();

    try{

        const{id}=req.params;

        const{cancelled_by}=req.body;

        await client.query("BEGIN");

        const booking = await client.query(

            `
            UPDATE bookings

            SET

                booking_status='CANCELLED',
                cancelled_at=NOW(),
                cancelled_by=$1

            WHERE id=$2

            RETURNING *

            `,

            [
                cancelled_by,
                id
            ]

        );

        if(booking.rows.length==0){

            await client.query("ROLLBACK");

            return res.status(404).json({

                message:"Booking not found"

            });

        }

        await client.query(

            `
            UPDATE parking_slots

            SET status='AVAILABLE'

            WHERE id=$1
            `,

            [

                booking.rows[0].slot_id

            ]

        );

        await client.query("COMMIT");

        res.json({

            message:"Booking cancelled successfully"

        });

    }catch(err){

        await client.query("ROLLBACK");

        res.status(500).json({

            error:err.message

        });

    }finally{

        client.release();

    }

};
module.exports.checkIn = async (req, res) => {

    const client = await pool.connect();

    try {

        const { id } = req.params;

        await client.query("BEGIN");

        const bookingResult = await client.query(
            `
            SELECT *
            FROM bookings
            WHERE id = $1
            `,
            [id]
        );

        if (bookingResult.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Booking not found"
            });

        }

        const booking = bookingResult.rows[0];

        if (booking.booking_status !== "CONFIRMED") {

            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "Only CONFIRMED bookings can be checked in."
            });

        }

        // Update Booking Status
        await client.query(
            `UPDATE bookings SET booking_status = 'ACTIVE' WHERE id = $1`,
            [id]
        );

        // Update Slot Status
        await client.query(
            `
            UPDATE parking_slots
            SET status = 'OCCUPIED'
            WHERE id = $1
            `,
            [booking.slot_id]
        );

        // Create Parking Session
        const session = await client.query(
            `
            INSERT INTO parking_sessions
            (
                booking_id,
                slot_id,
                entry_time
            )
            VALUES
            (
                $1,
                $2,
                NOW()
            )
            RETURNING *
            `,
            [
                booking.id,
                booking.slot_id
            ]
        );

        await client.query("COMMIT");

        res.status(200).json({
            message: "Vehicle checked in successfully.",
            session: session.rows[0]
        });

    } catch (err) {

        await client.query("ROLLBACK");

        res.status(500).json({
            error: err.message
        });

    } finally {

        client.release();

    }

};


module.exports.checkOut = async(req,res)=>{

    const client = await pool.connect();

    try{

        const{id}=req.params;

        await client.query("BEGIN");

const bookingResult = await client.query(
            `SELECT * FROM bookings WHERE id = $1`,
            [id]
        );

        if (bookingResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                message: 'Booking not found'
            });
        }

        const bookingRow = bookingResult.rows[0];

        const session = await client.query(
            `UPDATE parking_sessions SET exit_time = NOW() WHERE booking_id = $1 RETURNING *`,
            [id]
        );

        if (session.rows.length === 0 || !session.rows[0].entry_time) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Parking session not found or already checked out.' });
        }

        const entry = new Date(session.rows[0].entry_time);
        const exit = new Date();
        const hours = Math.max(1, Math.ceil((exit - entry) / (1000 * 60 * 60)));

        const slot = await client.query(
            `SELECT hourly_price FROM parking_slots WHERE id = $1`,
            [bookingRow.slot_id]
        );

        if (slot.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Slot not found' });
        }

        const fee =

            hours*slot.rows[0].hourly_price;

        await client.query(
            `UPDATE parking_sessions SET parking_fee = $1 WHERE booking_id = $2`,
            [fee, id]
        );

        await client.query(
            `UPDATE bookings SET booking_status = 'COMPLETED', total_amount = $1 WHERE id = $2`,
            [fee, id]
        );

        await client.query(
            `UPDATE parking_slots SET status = 'AVAILABLE' WHERE id = $1`,
            [bookingRow.slot_id]
        );

        await client.query("COMMIT");

        res.json({

            parking_fee:fee,
            hours:hours,
            message:"Checkout successful"

        });

    }catch(err){

        await client.query("ROLLBACK");

        res.status(500).json({

            error:err.message

        });

    }finally{

        client.release();

    }

};

