const Favorite = require('../models/Favorite');
const Attraction = require('../models/Attraction');
const { NotFoundError, ValidationError } = require('../utils/errors');

/**
 * 收藏服务类
 * 处理所有与收藏相关的业务逻辑
 */
class FavoriteService {
  /**
   * 添加收藏
   * @param {number} userId - 用户ID
   * @param {number} attractionId - 景点ID
   * @returns {Promise<Favorite>}
   * @throws {ValidationError} 当已经收藏过时
   * @throws {NotFoundError} 当景点不存在时
   */
  async addFavorite(userId, attractionId) {
    // 检查景点是否存在
    const attraction = await Attraction.findByPk(attractionId);
    if (!attraction) {
      throw new NotFoundError('景点');
    }

    // 检查是否已经收藏
    const existingFavorite = await Favorite.findOne({
      where: { userId, attractionId }
    });

    if (existingFavorite) {
      throw new ValidationError('您已经收藏过该景点');
    }

    return await Favorite.create({ userId, attractionId });
  }

  /**
   * 取消收藏
   * @param {number} userId - 用户ID
   * @param {number} attractionId - 景点ID
   * @returns {Promise<void>}
   * @throws {NotFoundError} 当收藏不存在时
   */
  async removeFavorite(userId, attractionId) {
    const favorite = await Favorite.findOne({
      where: { userId, attractionId }
    });

    if (!favorite) {
      throw new NotFoundError('收藏');
    }

    await favorite.destroy();
  }

  /**
   * 获取用户的收藏列表
   * @param {number} userId - 用户ID
   * @param {Object} query - 查询参数
   * @param {number} query.page - 页码
   * @param {number} query.pageSize - 每页数量
   * @returns {Promise<{rows: Favorite[], count: number}>}
   */
  async getUserFavorites(userId, query) {
    const { page = 1, pageSize = 10 } = query;

    return await Favorite.findAndCountAll({
      where: { userId },
      include: [{
        model: Attraction,
        attributes: ['id', 'name', 'image', 'description', 'avgRating', 'city']
      }],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * 检查用户是否已收藏景点
   * @param {number} userId - 用户ID
   * @param {number} attractionId - 景点ID
   * @returns {Promise<boolean>}
   */
  async checkFavorite(userId, attractionId) {
    const favorite = await Favorite.findOne({
      where: { userId, attractionId }
    });
    return !!favorite;
  }

  /**
   * 批量检查用户是否已收藏景点
   * @param {number} userId - 用户ID
   * @param {number[]} attractionIds - 景点ID数组
   * @returns {Promise<Object>} - 返回以景点ID为键的对象，值为布尔值表示是否收藏
   */
  async batchCheckFavorites(userId, attractionIds) {
    const favorites = await Favorite.findAll({
      where: {
        userId,
        attractionId: attractionIds
      }
    });

    const result = {};
    attractionIds.forEach(id => {
      result[id] = favorites.some(f => f.attractionId === id);
    });

    return result;
  }
}

module.exports = new FavoriteService(); 