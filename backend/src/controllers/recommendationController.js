const recommendationService = require('../services/recommendationService');

/**
 * 推荐控制器
 * 处理所有与推荐相关的请求
 */
class RecommendationController {
  /**
   * 获取热门推荐
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async getPopularRecommendations(req, res, next) {
    try {
      const recommendations = await recommendationService.getPopularRecommendations(req.query);
      res.json(recommendations);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取个性化推荐
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async getPersonalizedRecommendations(req, res, next) {
    try {
      const recommendations = await recommendationService.getPersonalizedRecommendations(
        req.user.id,
        req.query
      );
      res.json(recommendations);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取基于历史的推荐
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async getHistoryBasedRecommendations(req, res, next) {
    try {
      const recommendations = await recommendationService.getHistoryBasedRecommendations(
        req.user.id,
        req.query
      );
      res.json(recommendations);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取相似景点推荐
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async getSimilarAttractions(req, res, next) {
    try {
      const recommendations = await recommendationService.getSimilarAttractions(
        req.params.attractionId,
        req.query
      );
      res.json(recommendations);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新用户偏好
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async updatePreferences(req, res, next) {
    try {
      const preferences = await recommendationService.updatePreferences(
        req.user.id,
        req.body
      );
      res.json(preferences);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 提交推荐反馈
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async submitFeedback(req, res, next) {
    try {
      const result = await recommendationService.submitFeedback(
        req.user.id,
        req.body
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RecommendationController();