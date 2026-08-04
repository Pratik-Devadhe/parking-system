const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const userRouter = require("./routes/user.js");
const locationRouter = require("./routes/location.js");
const bookingRouter = require("./routes/booking.js");
const vehicleRouter = require("./routes/vehicle.js");
const slotRouter = require("./routes/slot.js");
const sessionRouter = require("./routes/sessions.js");

app.use("/" , userRouter);
app.use("/location" , locationRouter);
app.use("/booking" , bookingRouter);
app.use("/vehicle" , vehicleRouter);
app.use("/slot" , slotRouter);
app.use("/sessions" , sessionRouter);

app.get("/" , (req, res)=> {    res.json("express home");   });


app.listen(port  , ()=>{
    console.log(`listeing on port ${port}`);
});