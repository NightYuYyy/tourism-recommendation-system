const { Op } = require('sequelize');
const Attraction = require('../models/Attraction');
const { NotFoundError, ValidationError } = require('../utils/errors');

/**
 * 景点服务类
 * 处理所有与景点相关的业务逻辑
 */
class AttractionService {
  /**
   * 创建新景点
   * @param {Object} data - 景点数据
   * @returns {Promise<Attraction>}
   * @throws {ValidationError} 当数据验证失败时
   */
  async createAttraction(data) {
    const { name, latitude, longitude } = data;

    if (!name || !latitude || !longitude) {
      throw new ValidationError('名称和位置信息是必填的');
    }

    // 检查相同位置是否已存在景点
    const existingAttraction = await Attraction.findOne({
      where: {
        [Op.and]: [
          { latitude: { [Op.between]: [latitude - 0.0001, latitude + 0.0001] } },
          { longitude: { [Op.between]: [longitude - 0.0001, longitude + 0.0001] } }
        ]
      }
    });

    if (existingAttraction) {
      throw new ValidationError('该位置附近已存在景点');
    }

    return await Attraction.create(data);
  }

  /**
   * 更新景点信息
   * @param {number} id - 景点ID
   * @param {Object} data - 更新数据
   * @returns {Promise<Attraction>}
   * @throws {NotFoundError} 当景点不存在时
   */
  async updateAttraction(id, data) {
    const attraction = await Attraction.findByPk(id);
    if (!attraction) {
      throw new NotFoundError('景点');
    }

    await attraction.update(data);
    return attraction;
  }

  /**
   * 删除景点
   * @param {number} id - 景点ID
   * @returns {Promise<void>}
   * @throws {NotFoundError} 当景点不存在时
   */
  async deleteAttraction(id) {
    const attraction = await Attraction.findByPk(id);
    if (!attraction) {
      throw new NotFoundError('景点');
    }

    await attraction.destroy();
  }

  /**
   * 获取单个景点详情
   * @param {number} id - 景点ID
   * @returns {Promise<Attraction>}
   * @throws {NotFoundError} 当景点不存在时
   */
  async getAttractionById(id) {
    const attraction = await Attraction.findByPk(id);
    if (!attraction) {
      throw new NotFoundError('景点');
    }
    return attraction;
  }

  /**
   * 获取景点列表
   * @param {Object} query - 查询参数
   * @param {number} query.page - 页码
   * @param {number} query.pageSize - 每页数量
   * @param {string} query.keyword - 搜索关键词
   * @param {string} query.city - 城市筛选
   * @param {string} query.tags - 标签筛选
   * @returns {Promise<{rows: Attraction[], count: number}>}
   */
  async getAttractions(query) {
    const { page = 1, pageSize = 10, keyword, city, tags } = query;
    const where = {};

    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } }
      ];
    }

    if (city) {
      where.city = city;
    }

    if (tags) {
      const tagList = typeof tags === 'string' ? [tags] : tags;
      where.tags = { [Op.overlap]: tagList };
    }

    return await Attraction.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['avgRating', 'DESC']]
    });
  }

  /**
   * 获取附近的景点
   * @param {number} latitude - 纬度
   * @param {number} longitude - 经度
   * @param {number} radius - 半径（公里）
   * @returns {Promise<Attraction[]>}
   */
  async getNearbyAttractions(latitude, longitude, radius = 5) {
    return await Attraction.findNearby(latitude, longitude, radius);
  }

  /**
   * 更新景点评分
   * @param {number} id - 景点ID
   * @returns {Promise<void>}
   */
  async updateAttractionRating(id) {
    await Attraction.updateRating(id);
  }

  /**
   * 增加景点访问量
   * @param {number} id - 景点ID
   * @returns {Promise<void>}
   * @throws {NotFoundError} 当景点不存在时
   */
  async incrementVisitCount(id) {
    const attraction = await Attraction.findByPk(id);
    if (!attraction) {
      throw new NotFoundError('景点');
    }

    await attraction.increment('visitCount');
  }
}

module.exports = new AttractionService(); 