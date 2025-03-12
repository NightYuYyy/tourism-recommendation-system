const { User, Attraction, Rating } = require('../models/Attraction')
const { calculateUserSimilarity, generateRecommendations } = require('../utils/recommendationAlgorithm')
const redisClient = require('../config/redis')

// 获取个性化推荐
exports.getPersonalRecommendations = async (req, res) => {
  try {
    const userId = req.user.id

    // 尝试从Redis缓存获取推荐结果
    const cachedRecommendations = await redisClient.get(`recommendations:${userId}`)
    if (cachedRecommendations) {
      return res.json(JSON.parse(cachedRecommendations))
    }

    // 获取用户评分数据
    const userRatings = await Rating.findAll({
      where: { userId },
      include: [{ model: Attraction }]
    })

    if (userRatings.length === 0) {
      // 如果用户没有评分记录，返回热门景点
      const popularAttractions = await Attraction.findAll({
        order: [['avgRating', 'DESC']],
        limit: 10
      })
      return res.json({
        type: 'popular',
        recommendations: popularAttractions
      })
    }

    // 获取所有用户的评分数据用于计算相似度
    const allRatings = await Rating.findAll({
      include: [
        { model: User },
        { model: Attraction }
      ]
    })

    // 计算用户相似度
    const similarUsers = calculateUserSimilarity(userId, allRatings)

    // 生成推荐
    const recommendations = await generateRecommendations(userId, similarUsers, allRatings)

    // 获取推荐景点的详细信息
    const recommendedAttractions = await Attraction.findAll({
      where: {
        id: recommendations.map(rec => rec.attractionId)
      },
      include: [{
        model: Rating,
        include: [{ model: User }]
      }]
    })

    // 添加推荐理由
    const recommendationsWithReason = recommendedAttractions.map(attraction => {
      const rec = recommendations.find(r => r.attractionId === attraction.id)
      return {
        ...attraction.toJSON(),
        recommendationReason: rec.reason,
        similarityScore: rec.similarityScore
      }
    })

    // 将结果缓存到Redis（2小时过期）
    await redisClient.setex(
      `recommendations:${userId}`,
      7200,
      JSON.stringify({
        type: 'personalized',
        recommendations: recommendationsWithReason
      })
    )

    res.json({
      type: 'personalized',
      recommendations: recommendationsWithReason
    })
  } catch (error) {
    console.error('获取推荐错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
}

// 获取热门景点
exports.getPopularAttractions = async (req, res) => {
  try {
    const popularAttractions = await Attraction.findAll({
      order: [['avgRating', 'DESC']],
      limit: 10,
      include: [{
        model: Rating,
        include: [{ model: User }]
      }]
    })

    res.json({ attractions: popularAttractions })
  } catch (error) {
    console.error('获取热门景点错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
}

// 获取相似景点
exports.getSimilarAttractions = async (req, res) => {
  try {
    const { id } = req.params
    const attraction = await Attraction.findByPk(id)

    if (!attraction) {
      return res.status(404).json({ message: '景点不存在' })
    }

    // 基于类别和标签查找相似景点
    const similarAttractions = await Attraction.findAll({
      where: {
        id: { [Op.ne]: id },
        [Op.or]: [
          { category: attraction.category },
          { tags: { [Op.overlap]: attraction.tags } }
        ]
      },
      limit: 6,
      order: [['avgRating', 'DESC']]
    })

    res.json({ attractions: similarAttractions })
  } catch (error) {
    console.error('获取相似景点错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
}

// 提交推荐反馈
exports.submitRecommendationFeedback = async (req, res) => {
  try {
    const { attractionId, isHelpful, feedback } = req.body
    const userId = req.user.id

    // 记录用户反馈
    await RecommendationFeedback.create({
      userId,
      attractionId,
      isHelpful,
      feedback
    })

    // 清除该用户的推荐缓存，下次将重新计算
    await redisClient.del(`recommendations:${userId}`)

    res.json({ message: '反馈提交成功' })
  } catch (error) {
    console.error('提交推荐反馈错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
}