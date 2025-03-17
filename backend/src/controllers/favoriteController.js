const favoriteService = require('../services/favoriteService');
const { AuthorizationError } = require('../utils/errors');

/**
 * 收藏控制器
 * 处理所有与收藏相关的请求
 */
class FavoriteController {
  /**
   * 获取用户收藏列表
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async getUserFavorites(req, res, next) {
    try {
      const result = await favoriteService.getUserFavorites(
        req.params.userId || req.user.id,
        req.query
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 添加收藏
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async addFavorite(req, res, next) {
    try {
      const favorite = await favoriteService.addFavorite(
        req.user.id,
        req.params.attractionId
      );
      res.status(201).json(favorite);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 取消收藏
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async removeFavorite(req, res, next) {
    try {
      await favoriteService.removeFavorite(
        req.user.id,
        req.params.attractionId
      );
      res.json({ message: '收藏已取消' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 检查是否已收藏
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async checkFavorite(req, res, next) {
    try {
      const isFavorite = await favoriteService.checkFavorite(
        req.user.id,
        req.params.attractionId
      );
      res.json({ isFavorite });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 批量检查收藏状态
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async batchCheckFavorites(req, res, next) {
    try {
      const result = await favoriteService.batchCheckFavorites(
        req.user.id,
        req.body.attractionIds
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FavoriteController();