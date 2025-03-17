const Attraction = require('../models/Attraction');
const { NotFoundError, ValidationError, AuthorizationError } = require('../utils/errors');
const Rating = require('../models/Rating');
const User = require('../models/User');

/**
 * 评论服务类
 * 处理所有与评论相关的业务逻辑
 */
class ReviewService {
  /**
   * 创建新评论
   * @param {Object} data - 评论数据
   * @param {number} userId - 用户ID
   * @returns {Promise<Rating>}
   * @throws {ValidationError} 当数据验证失败时
   * @throws {NotFoundError} 当景点不存在时
   */
  async createReview(data, userId) {
    const { attractionId, comment, rating } = data;

    if (!attractionId || !comment || !rating) {
      throw new ValidationError('景点ID、评论内容和评分都是必填的');
    }

    // 检查景点是否存在
    const attraction = await Attraction.findByPk(attractionId);
    if (!attraction) {
      throw new NotFoundError('景点');
    }

    // 检查用户是否已经评论过该景点
    const existingRating = await Rating.findOne({
      where: {
        userId,
        attractionId
      }
    });

    if (existingRating) {
      throw new ValidationError('您已经评论过该景点');
    }

    const review = await Rating.create({
      userId,
      attractionId,
      rating,
      comment
    });

    return review;
  }

  /**
   * 更新评论
   * @param {number} id - 评论ID
   * @param {Object} data - 更新数据
   * @param {number} userId - 用户ID
   * @returns {Promise<Rating>}
   * @throws {NotFoundError} 当评论不存在时
   * @throws {AuthorizationError} 当用户无权限时
   */
  async updateReview(id, data, userId) {
    const review = await Rating.findByPk(id);
    if (!review) {
      throw new NotFoundError('评论');
    }

    if (review.userId !== userId) {
      throw new AuthorizationError('您没有权限修改此评论');
    }

    await review.update({
      rating: data.rating,
      comment: data.comment
    });

    return review;
  }

  /**
   * 删除评论
   * @param {number} id - 评论ID
   * @param {number} userId - 用户ID
   * @returns {Promise<void>}
   * @throws {NotFoundError} 当评论不存在时
   * @throws {AuthorizationError} 当用户无权限时
   */
  async deleteReview(id, userId) {
    const review = await Rating.findByPk(id);
    if (!review) {
      throw new NotFoundError('评论');
    }

    if (review.userId !== userId) {
      throw new AuthorizationError('您没有权限删除此评论');
    }

    await review.destroy();
  }

  /**
   * 获取景点的评论列表
   * @param {number} attractionId - 景点ID
   * @param {Object} query - 查询参数
   * @param {number} query.page - 页码
   * @param {number} query.pageSize - 每页数量
   * @returns {Promise<{rows: Rating[], count: number}>}
   */
  async getAttractionReviews(attractionId, query) {
    const { page = 1, pageSize = 10 } = query;

    return await Rating.findAndCountAll({
      where: { 
        attractionId,
        status: 'approved'  // 只返回已审核通过的评论
      },
      include: [{
        model: User,
        attributes: ['id', 'username', 'avatar']
      }],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * 获取用户的评论列表
   * @param {number} userId - 用户ID
   * @param {Object} query - 查询参数
   * @param {number} query.page - 页码
   * @param {number} query.pageSize - 每页数量
   * @returns {Promise<{rows: Rating[], count: number}>}
   */
  async getUserReviews(userId, query) {
    const { page = 1, pageSize = 10 } = query;

    return await Rating.findAndCountAll({
      where: { userId },
      include: [{
        model: Attraction,
        attributes: ['id', 'name', 'image']
      }],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['createdAt', 'DESC']]
    });
  }
}

module.exports = new ReviewService();