const express = require("express");
const router = express.Router();

const locationController = require("../controllers/location.js");

router.get(
    "/",
    locationController.getAllLocation
);

router.post(
    "/create",
    locationController.createLocation
);

router.delete(
    "/:id",
    locationController.deleteLocation
);

router.patch(
    "/:id",
    locationController.updateLocation
);


module.exports = router;
