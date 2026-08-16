const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.js');
const { authenticateToken, requireRole } = require('../middleware/auth.js');

// Public Auth Endpoints
router.post('/create_user', userController.createUser);
router.post('/login', userController.loginUser);

// Protected Routes
router.get('/user', authenticateToken, requireRole(['ADMIN']), userController.getAllUsers);
router.get('/user/:id', authenticateToken, userController.getUserById);
router.patch('/user/:id/status', authenticateToken, requireRole(['ADMIN']), userController.updateUserStatus);
router.patch('/user/:id/verify', authenticateToken, requireRole(['ADMIN']), userController.verifyUser);
router.put('/user/:id', authenticateToken, userController.updateUser);
router.patch('/user/:id', authenticateToken, userController.updateUser);
router.delete('/user/:id', authenticateToken, requireRole(['ADMIN']), userController.deleteUser);

module.exports = router;


