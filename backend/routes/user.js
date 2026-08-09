const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.js');

router.get('/user', userController.getAllUsers);
router.get('/user/:id', userController.getUserById);
router.post('/create_user', userController.createUser);
router.post('/login', userController.loginUser);
router.patch('/user/:id/status', userController.updateUserStatus);
router.patch('/user/:id/verify', userController.verifyUser);
router.put('/user/:id', userController.updateUser);
router.patch('/user/:id', userController.updateUser);
router.delete('/user/:id', userController.deleteUser);

module.exports = router;

