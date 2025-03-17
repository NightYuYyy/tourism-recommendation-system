const systemService = require('../services/systemService');
const { AuthorizationError } = require('../utils/errors');

/**
 * 系统控制器
 * 处理所有与系统相关的请求
 */
class SystemController {
  /**
   * 同步数据库结构
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async syncDatabase(req, res, next) {
    try {
      if (req.user.role !== 'admin') {
        throw new AuthorizationError();
      }
      const force = req.body.force === true;
      const result = await systemService.syncDatabase(force);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SystemController(); 