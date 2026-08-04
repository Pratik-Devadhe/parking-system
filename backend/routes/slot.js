const express = require("express");
const router = express.Router();

const slotController = require("../controllers/slot");

// Create Slot
// POST /slot
router.post("/", slotController.createSlot);

// Get All Slots
// GET /slot
router.get("/", slotController.getAllSlots);

// Get Slot Statistics for a Location
// GET /slot/location/:locationId/stats
router.get("/location/:locationId/stats", slotController.getSlotStatistics);

// Get All Slots of a Location
// GET /slot/location/:locationId
router.get("/location/:locationId", slotController.getSlotsByLocation);

// Get Available Slots of a Location
// GET /slot/location/:locationId/available
router.get(
    "/location/:locationId/available",
    slotController.getAvailableSlots
);

// Get Occupied Slots of a Location
// GET /slot/location/:locationId/occupied
router.get(
    "/location/:locationId/occupied",
    slotController.getOccupiedSlots
);

// Get Slot By ID
// GET /slot/:id
router.get("/:id", slotController.getSlotById);

// Update Complete Slot
// PATCH /slot/:id
router.patch("/:id", slotController.updateSlot);

// Update Only Slot Status
// PATCH /slot/:id/status
router.patch("/:id/status", slotController.updateSlotStatus);

// Delete Slot
// DELETE /slot/:id
router.delete("/:id", slotController.deleteSlot);

module.exports = router;