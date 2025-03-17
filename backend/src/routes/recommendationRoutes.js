const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { authenticateToken } = require('../middleware/auth');

/**
 * 推荐相关路由
 * @module routes/recommendations
 */

// 公开路由
router.get('/popular', recommendationController.getPopularRecommendations);
router.get('/similar/:attractionId', recommendationController.getSimilarAttractions);

// 需要认证的路由
router.use(authenticateToken);
router.get('/personalized', recommendationController.getPersonalizedRecommendations);
router.get('/history-based', recommendationController.getHistoryBasedRecommendations);
router.put('/preferences', recommendationController.updatePreferences);

module.exports = router;