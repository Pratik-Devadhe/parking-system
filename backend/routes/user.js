const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.js');

router.get('/user', userController.getAllUsers);

router.post('/create_user', userController.createUser);




module.exports = router;
