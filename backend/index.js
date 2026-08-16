require("dotenv").config();

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
const notificationRouter = require("./routes/notification.js");
const disputeRouter = require("./routes/dispute.js");
const settingRouter = require("./routes/setting.js");

app.use("/", userRouter);
app.use("/location", locationRouter);
app.use("/booking", bookingRouter);
app.use("/vehicle", vehicleRouter);
app.use("/slot", slotRouter);
app.use("/sessions", sessionRouter);
app.use("/notification", notificationRouter);
app.use("/dispute", disputeRouter);
app.use("/setting", settingRouter);

app.get("/", (req, res) => {
    res.json("PARK-X Backend API Server Active");
});

app.listen(port, () => {
    console.log(`PARK-X Backend server running on port ${port}`);
});