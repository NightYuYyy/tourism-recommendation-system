const authService = require('../services/authService')
const { AuthorizationError, ValidationError } = require('../utils/errors')

/**
 * 认证控制器
 * 处理所有与认证相关的请求
 */
class AuthController {
  /**
   * 用户注册
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body)
      res.status(201).json({
        message: '注册成功',
        ...result
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 用户登录
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async login(req, res, next) {
    try {
      const result = await authService.login(req.body)
      res.json({
        message: '登录成功',
        ...result
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 获取当前用户信息
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async getCurrentUser(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user.id)
      res.json({ user })
    } catch (error) {
      next(error)
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
      const user = await authService.updateUser(req.user.id, req.body)
      res.json({
        message: '用户信息更新成功',
        user
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 修改密码
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async changePassword(req, res, next) {
    try {
      await authService.changePassword(
        req.user.id,
        req.body.oldPassword,
        req.body.newPassword
      )
      res.json({ message: '密码修改成功' })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new AuthController()