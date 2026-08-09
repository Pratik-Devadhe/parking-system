const express = require('express');
const router = express.Router();
const disputeController = require('../controllers/dispute.js');

router.get('/', disputeController.getAllDisputes);
router.get('/user/:userId', disputeController.getDisputesByUser);
router.post('/', disputeController.createDispute);
router.patch('/:id/status', disputeController.updateDisputeStatus);

module.exports = router;
