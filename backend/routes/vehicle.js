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
router.patch("/:id", vehicleController.updateVehicle);
router.put("/:id", vehicleController.updateVehicle);

// Delete Vehicle
router.delete("/:id", vehicleController.deleteVehicle);

module.exports = router;