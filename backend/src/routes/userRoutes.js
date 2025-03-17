const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, checkRole } = require('../middleware/auth');
const { Op } = require('sequelize');
const Attraction = require('../models/Attraction');
const Rating = require('../models/Rating');

/**
 * 用户相关路由
 * @module routes/users
 */

// 需要认证的路由
router.use(authenticateToken);

// 管理员路由
router.get('/', checkRole(['admin']), userController.getUsers);
router.delete('/:id', checkRole(['admin']), userController.deleteUser);

// 用户路由
router.get('/favorites', userController.getUserFavorites);
router.get('/reviews', userController.getUserReviews);
router.get('/:id', userController.getUserById);
router.put('/profile', userController.updateUser);
router.put('/preferences', userController.updatePreferences);
router.put('/password', userController.updatePassword);



module.exports = router; 