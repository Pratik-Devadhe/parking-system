const express = require("express");
const router = express.Router();

const vehicleController = require("../controllers/vehicle");

// Create Vehicle
router.post('/', vehicleController.createVehicle);

// Get All Vehicles
router.get('/', vehicleController.getAllVehicles);

// Get Vehicles By User
router.get('/user/:userId', vehicleController.getVehiclesByUser);

// Get Vehicle By ID
router.get('/:id', vehicleController.getVehicleById);

// Update Vehicle
// router.patch("/:id", vehicleController.updateVehicle);

// Delete Vehicle
router.delete("/:id", vehicleController.deleteVehicle); // not working properly     "error": "update or delete on table \"vehicles\" violates foreign key constraint \"fk_booking_vehicle\" on table \"bookings\""

module.exports = router;