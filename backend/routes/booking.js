const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.js');

router.get('/', bookingController.getAllBookings);
router.get('/user/:userId', bookingController.getBookingsByUser);
router.get('/owner/:ownerId', bookingController.getBookingsByOwner);
router.get('/owner/earnings/:ownerId', bookingController.getOwnerEarnings);
router.get('/:id', bookingController.getBookingById);
router.post('/', bookingController.createBooking);
router.post('/availability', bookingController.checkAvailability);
router.post('/block', bookingController.blockSlotTimeframe);
router.patch('/:id/approve', bookingController.approveBooking);
router.patch('/:id/reject', bookingController.rejectBooking);
router.patch('/:id/cancel', bookingController.cancelBooking);
router.post('/:id/checkin', bookingController.checkIn);
router.post('/:id/checkout', bookingController.checkOut);

module.exports = router;
