const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/auth');

/**
 * 评论相关路由
 * @module routes/reviews
 */

// 公开路由
router.get('/attraction/:attractionId', reviewController.getAttractionReviews);
router.get('/user/:userId', reviewController.getUserReviews);

// 需要认证的路由
router.use(authenticateToken);
router.post('/', reviewController.createReview);
router.put('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);
router.get('/me', reviewController.getUserReviews);

module.exports = router; 