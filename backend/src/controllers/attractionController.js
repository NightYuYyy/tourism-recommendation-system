const attractionService = require('../services/attractionService');
const { AuthorizationError } = require('../utils/errors');

/**
 * 景点控制器
 * 处理所有与景点相关的请求
 */
class AttractionController {
  /**
   * 获取景点列表
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async getAttractions(req, res, next) {
    try {
      const result = await attractionService.getAttractions(req.query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取景点详情
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async getAttractionById(req, res, next) {
    try {
      const attraction = await attractionService.getAttractionById(req.params.id);
      res.json(attraction);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建新景点
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async createAttraction(req, res, next) {
    try {
      if (req.user.role !== 'admin') {
        throw new AuthorizationError('只有管理员可以创建景点');
      }
      const attraction = await attractionService.createAttraction(req.body);
      res.status(201).json(attraction);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新景点信息
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async updateAttraction(req, res, next) {
    try {
      if (req.user.role !== 'admin') {
        throw new AuthorizationError('只有管理员可以更新景点');
      }
      const attraction = await attractionService.updateAttraction(
        req.params.id,
        req.body
      );
      res.json(attraction);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除景点
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async deleteAttraction(req, res, next) {
    try {
      if (req.user.role !== 'admin') {
        throw new AuthorizationError('只有管理员可以删除景点');
      }
      await attractionService.deleteAttraction(req.params.id);
      res.json({ message: '景点删除成功' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 搜索景点
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async searchAttractions(req, res, next) {
    try {
      const result = await attractionService.searchAttractions(req.query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取附近的景点
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express next中间件函数
   */
  async getNearbyAttractions(req, res, next) {
    try {
      const { latitude, longitude, radius } = req.query;
      const attractions = await attractionService.getNearbyAttractions(
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(radius)
      );
      res.json({ attractions });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AttractionController();