const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authenticateToken } = require('../middleware/auth');

/**
 * 收藏相关路由
 * @module routes/favorites
 */

// 公开路由
router.get('/user/:userId', favoriteController.getUserFavorites);

// 需要认证的路由
router.use(authenticateToken);
router.post('/attraction/:attractionId', favoriteController.addFavorite);
router.delete('/attraction/:attractionId', favoriteController.removeFavorite);
router.get('/me', favoriteController.getUserFavorites);
router.get('/check/:attractionId', favoriteController.checkFavorite);
router.post('/check-batch', favoriteController.batchCheckFavorites);

module.exports = router; 