const userService = require('../services/userService');
const { AuthorizationError } = require('../utils/errors');

/**
 * 用户控制器
 * 处理所有与用户相关的请求
 */
class UserController {
  /**
   * 获取用户列表（管理员功能）
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async getUsers(req, res, next) {
    try {
      const result = await userService.getUsers(req.query);
      res.json({
        users: result.rows,
        total: result.count,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        totalPages: Math.ceil(result.count / (parseInt(req.query.limit) || 10))
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取用户详情
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(
        parseInt(req.params.id),
        req.user.id,
        req.user.role
      );
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新用户信息
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async updateUser(req, res, next) {
    try {
      const user = await userService.updateUser(req.user.id, req.body);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新用户偏好设置
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async updatePreferences(req, res, next) {
    try {
      const preferences = await userService.updatePreferences(
        req.user.id,
        req.body
      );
      res.json(preferences);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新用户密码
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async updatePassword(req, res, next) {
    try {
      await userService.updatePassword(
        req.user.id,
        req.body.currentPassword,
        req.body.newPassword
      );
      res.json({ message: '密码更新成功' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除用户账号
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async deleteUser(req, res, next) {
    try {
      if (req.user.role !== 'admin') {
        throw new AuthorizationError();
      }
      await userService.deleteUser(parseInt(req.params.id));
      res.json({ message: '用户账号已删除' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取用户收藏列表
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async getUserFavorites(req, res, next) {
    try {
      const favorites = await userService.getUserFavorites(req.user.id);
      res.json(favorites);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取用户评价列表
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async getUserReviews(req, res, next) {
    try {
      const reviews = await userService.getUserReviews(req.user.id);
      res.json(reviews);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController(); 