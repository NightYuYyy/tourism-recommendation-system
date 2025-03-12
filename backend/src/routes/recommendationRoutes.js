const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const redisClient = require('../config/redis');
const Attraction = require('../models/Attraction');
const Rating = require('../models/Rating');
const { calculateSimilarUsers, getRecommendations } = require('../utils/recommendationAlgorithm');

// 获取个性化推荐
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = `recommendations:${userId}`;

    // 尝试从缓存获取推荐结果
    const cachedRecommendations = await redisClient.get(cacheKey);
    if (cachedRecommendations) {
      return res.json(JSON.parse(cachedRecommendations));
    }

    // 获取用户评分数据
    const userRatings = await Rating.findAll({
      where: { userId },
      include: [{
        model: Attraction,
        attributes: ['id', 'name', 'category', 'tags']
      }]
    });

    // 如果用户没有评分记录，返回热门景点
    if (userRatings.length === 0) {
      const popularAttractions = await Attraction.findAll({
        order: [['averageRating', 'DESC']],
        limit: 10
      });
      return res.json({
        type: 'popular',
        recommendations: popularAttractions
      });
    }

    // 计算个性化推荐
    const similarUsers = await calculateSimilarUsers(userId);
    const recommendations = await getRecommendations(userId, similarUsers);

    // 缓存推荐结果（2小时）
    await redisClient.setEx(cacheKey, 7200, JSON.stringify({
      type: 'personalized',
      recommendations
    }));

    res.json({
      type: 'personalized',
      recommendations
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取基于位置的推荐
router.get('/nearby', auth, async (req, res) => {
  try {
    const { latitude, longitude, radius = 5000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: '需要提供位置信息' });
    }

    const nearbyAttractions = await Attraction.findNearby(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(radius)
    );

    res.json(nearbyAttractions);
  } catch (error) {
    console.error('Get nearby recommendations error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取相似景点推荐
router.get('/similar/:attractionId', async (req, res) => {
  try {
    const { attractionId } = req.params;
    const attraction = await Attraction.findByPk(attractionId);

    if (!attraction) {
      return res.status(404).json({ message: '景点不存在' });
    }

    // 基于标签和类别查找相似景点
    const similarAttractions = await Attraction.findAll({
      where: {
        id: { [Op.ne]: attractionId },
        [Op.or]: [
          { category: attraction.category },
          { tags: { [Op.overlap]: attraction.tags } }
        ]
      },
      limit: 5,
      order: [['averageRating', 'DESC']]
    });

    res.json(similarAttractions);
  } catch (error) {
    console.error('Get similar attractions error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 提交推荐反馈
router.post('/feedback', auth, async (req, res) => {
  try {
    const { attractionId, isRelevant } = req.body;
    const userId = req.user.id;

    // 记录用户反馈
    await redisClient.hSet(
      `recommendation_feedback:${userId}`,
      attractionId,
      isRelevant ? '1' : '0'
    );

    res.json({ message: '反馈已记录' });
  } catch (error) {
    console.error('Submit recommendation feedback error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;