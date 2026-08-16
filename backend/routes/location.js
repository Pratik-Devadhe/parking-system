const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.js');

router.get('/', locationController.getAllLocation);
router.get('/:id' , locationController.getLocationById);
router.get('/owner/:ownerId', locationController.getLocationsByOwner);
router.post('/search', locationController.searchLocations);
router.post('/create', locationController.createLocation);
router.patch('/:id/verify', locationController.verifyLocation);
router.patch('/:id', locationController.updateLocation);
router.delete('/:id', locationController.deleteLocation);

module.exports = router;
