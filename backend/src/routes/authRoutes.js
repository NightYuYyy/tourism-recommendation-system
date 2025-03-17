const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

/**
 * 认证相关路由
 * @module routes/auth
 */

// 公开路由
router.post('/register', authController.register);
router.post('/login', authController.login);

// 需要认证的路由
router.use(authenticateToken);
router.get('/me', authController.getCurrentUser);
router.put('/update', authController.updateUser);
router.put('/change-password', authController.changePassword);

module.exports = router;