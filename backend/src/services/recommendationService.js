const { Op } = require('sequelize');
const Attraction = require('../models/Attraction');
const Rating = require('../models/Rating');
const User = require('../models/User');
const { NotFoundError } = require('../utils/errors');

/**
 * 推荐服务类
 * 处理所有与推荐相关的业务逻辑
 */
class RecommendationService {
  /**
   * 获取个性化推荐
   * @param {number} userId - 用户ID
   * @param {number} limit - 返回数量
   * @returns {Promise<Attraction[]>}
   */
  async getPersonalizedRecommendations(userId, limit = 10) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('用户');
    }

    // 获取用户的偏好
    const preferences = user.preferences || {};
    const { tags = [], cities = [] } = preferences;

    // 构建查询条件
    const where = {};
    if (tags.length > 0) {
      where.tags = { [Op.overlap]: tags };
    }
    if (cities.length > 0) {
      where.city = { [Op.in]: cities };
    }

    // 获取用户评分过的景点
    const userRatings = await Rating.findAll({
      where: { 
        userId,
        status: 'approved' // 只考虑已审核通过的评分
      },
      attributes: ['attractionId', 'rating']
    });

    // 排除用户已评分的景点
    const excludeIds = userRatings.map(rating => rating.attractionId);
    if (excludeIds.length > 0) {
      where.id = { [Op.notIn]: excludeIds };
    }

    // 根据用户偏好和评分获取推荐
    return await Attraction.findAll({
      where,
      limit,
      order: [
        ['avgRating', 'DESC'],
        ['visitCount', 'DESC']
      ]
    });
  }

  /**
   * 获取热门推荐
   * @param {Object} query - 查询参数
   * @param {string} query.city - 城市筛选
   * @param {number} query.limit - 返回数量
   * @returns {Promise<Attraction[]>}
   */
  async getPopularRecommendations(query) {
    const { city, limit = 10 } = query;
    const where = {};

    if (city) {
      where.city = city;
    }

    return await Attraction.findAll({
      where,
      limit,
      order: [
        ['visitCount', 'DESC'],
        ['avgRating', 'DESC']
      ]
    });
  }

  /**
   * 获取相似景点推荐
   * @param {number} attractionId - 景点ID
   * @param {number} limit - 返回数量
   * @returns {Promise<Attraction[]>}
   * @throws {NotFoundError} 当景点不存在时
   */
  async getSimilarAttractions(attractionId, limit = 5) {
    const attraction = await Attraction.findByPk(attractionId);
    if (!attraction) {
      throw new NotFoundError('景点');
    }

    const { tags, city } = attraction;

    return await Attraction.findAll({
      where: {
        id: { [Op.ne]: attractionId },
        [Op.or]: [
          { tags: { [Op.overlap]: tags } },
          { city }
        ]
      },
      limit,
      order: [
        ['avgRating', 'DESC']
      ]
    });
  }

  /**
   * 获取基于用户历史的推荐
   * @param {number} userId - 用户ID
   * @param {number} limit - 返回数量
   * @returns {Promise<Attraction[]>}
   */
  async getHistoryBasedRecommendations(userId, limit = 10) {
    // 获取用户的评分历史
    const userRatings = await Rating.findAll({
      where: { 
        userId,
        status: 'approved' // 只考虑已审核通过的评分
      },
      include: [{
        model: Attraction,
        attributes: ['id', 'tags', 'city']
      }]
    });

    // 如果用户没有评分历史，返回热门推荐
    if (userRatings.length === 0) {
      return this.getPopularRecommendations({ limit });
    }

    // 收集用户感兴趣的标签和城市
    const tagFrequency = {};
    const cityFrequency = {};
    userRatings.forEach(rating => {
      const { tags, city } = rating.Attraction;
      tags.forEach(tag => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
      });
      cityFrequency[city] = (cityFrequency[city] || 0) + 1;
    });

    // 获取最常见的标签和城市
    const popularTags = Object.entries(tagFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);

    const popularCities = Object.entries(cityFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([city]) => city);

    // 基于用户兴趣推荐景点
    return await Attraction.findAll({
      where: {
        id: { [Op.notIn]: userRatings.map(r => r.attractionId) },
        [Op.or]: [
          { tags: { [Op.overlap]: popularTags } },
          { city: { [Op.in]: popularCities } }
        ]
      },
      limit,
      order: [
        ['avgRating', 'DESC']
      ]
    });
  }

  /**
   * 更新用户偏好
   * @param {number} userId - 用户ID
   * @param {Object} preferences - 用户偏好
   * @returns {Promise<void>}
   * @throws {NotFoundError} 当用户不存在时
   */
  async updateUserPreferences(userId, preferences) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('用户');
    }

    await user.update({ preferences });
  }
}

module.exports = new RecommendationService();