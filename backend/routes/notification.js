const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.js');

router.get('/user/:userId', notificationController.getNotificationsByUser);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/user/:userId/read-all', notificationController.markAllAsRead);
router.post('/', notificationController.createNotification);

module.exports = router;
