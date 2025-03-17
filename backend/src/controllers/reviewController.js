const reviewService = require('../services/reviewService');
const { AuthorizationError } = require('../utils/errors');

/**
 * 评论控制器
 * 处理所有与评论相关的请求
 */
class ReviewController {
  /**
   * 获取景点的评论列表
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async getAttractionReviews(req, res, next) {
    try {
      const result = await reviewService.getAttractionReviews(
        req.params.attractionId,
        req.query
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取用户的评论列表
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async getUserReviews(req, res, next) {
    try {
      const result = await reviewService.getUserReviews(
        req.params.userId,
        req.query
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建评论
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async createReview(req, res, next) {
    try {
      const review = await reviewService.createReview(req.user.id, req.body);
      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新评论
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async updateReview(req, res, next) {
    try {
      const review = await reviewService.getReviewById(req.params.id);
      if (review.userId !== req.user.id && req.user.role !== 'admin') {
        throw new AuthorizationError('没有权限修改此评论');
      }
      const updatedReview = await reviewService.updateReview(
        req.params.id,
        req.body
      );
      res.json(updatedReview);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除评论
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async deleteReview(req, res, next) {
    try {
      const review = await reviewService.getReviewById(req.params.id);
      if (review.userId !== req.user.id && req.user.role !== 'admin') {
        throw new AuthorizationError('没有权限删除此评论');
      }
      await reviewService.deleteReview(req.params.id);
      res.json({ message: '评论删除成功' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReviewController(); 