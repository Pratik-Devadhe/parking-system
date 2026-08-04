const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/booking");

// Create Booking
router.post("/", bookingController.createBooking);

// Check Availability
router.post("/availability", bookingController.checkAvailability);

// Get All Bookings
router.get(
    '/',
    bookingController.getAllBookings
);

// Get All Bookings of User
router.get('/user/:userId', bookingController.getBookingsByUser);

// Get Booking By ID
router.get('/:id', bookingController.getBookingById);

// Cancel Booking
router.patch(
    "/:id/cancel",
    bookingController.cancelBooking
);

// Vehicle Check In
router.post(
    "/:id/checkin",
    bookingController.checkIn
);

// Vehicle Check Out
router.post(
    "/:id/checkout",
    bookingController.checkOut
);


module.exports = router;
