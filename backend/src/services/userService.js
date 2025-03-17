const { Op } = require('sequelize');
const User = require('../models/User');
const Rating = require('../models/Rating');
const Attraction = require('../models/Attraction');
const { NotFoundError, ValidationError, AuthorizationError } = require('../utils/errors');

/**
 * 用户服务类
 * 处理所有与用户相关的业务逻辑
 */
class UserService {
  /**
   * 获取用户列表（管理员功能）
   * @param {Object} query - 查询参数
   * @param {number} query.page - 页码
   * @param {number} query.limit - 每页数量
   * @returns {Promise<{rows: User[], count: number}>}
   */
  async getUsers(query) {
    const { page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;
    
    return await User.findAndCountAll({
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * 获取用户详情
   * @param {number} userId - 用户ID
   * @param {number} requestUserId - 请求用户的ID
   * @param {string} userRole - 请求用户的角色
   * @returns {Promise<User>}
   * @throws {NotFoundError} 当用户不存在时
   * @throws {AuthorizationError} 当没有权限时
   */
  async getUserById(userId, requestUserId, userRole) {
    // 只允许用户查看自己的信息或管理员查看任何用户
    if (requestUserId !== userId && userRole !== 'admin') {
      throw new AuthorizationError('没有权限查看其他用户信息');
    }

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw new NotFoundError('用户');
    }

    return user;
  }

  /**
   * 更新用户信息
   * @param {number} userId - 用户ID
   * @param {Object} data - 更新数据
   * @returns {Promise<User>}
   * @throws {NotFoundError} 当用户不存在时
   * @throws {ValidationError} 当验证失败时
   */
  async updateUser(userId, data) {
    const { username, email, phone } = data;

    // 检查用户名和邮箱是否已被其他用户使用
    if (username) {
      const existingUser = await User.findOne({
        where: {
          username,
          id: { [Op.ne]: userId }
        }
      });
      
      if (existingUser) {
        throw new ValidationError('用户名已被使用');
      }
    }

    if (email) {
      const existingUser = await User.findOne({
        where: {
          email,
          id: { [Op.ne]: userId }
        }
      });
      
      if (existingUser) {
        throw new ValidationError('邮箱已被使用');
      }
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('用户');
    }

    // 只更新提供的字段
    if (username) user.username = username;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    await user.save();

    return await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
  }

  /**
   * 更新用户偏好设置
   * @param {number} userId - 用户ID
   * @param {Object} preferences - 偏好设置
   * @returns {Promise<Object>}
   * @throws {NotFoundError} 当用户不存在时
   */
  async updatePreferences(userId, preferences) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('用户');
    }

    user.preferences = preferences;
    await user.save();

    return user.preferences;
  }

  /**
   * 更新用户密码
   * @param {number} userId - 用户ID
   * @param {string} currentPassword - 当前密码
   * @param {string} newPassword - 新密码
   * @returns {Promise<void>}
   * @throws {NotFoundError} 当用户不存在时
   * @throws {ValidationError} 当密码验证失败时
   */
  async updatePassword(userId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
      throw new ValidationError('当前密码和新密码不能为空');
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('用户');
    }

    const isValid = await user.validatePassword(currentPassword);
    if (!isValid) {
      throw new ValidationError('当前密码不正确');
    }

    user.password = newPassword;
    await user.save();
  }

  /**
   * 删除用户账号
   * @param {number} userId - 用户ID
   * @returns {Promise<void>}
   * @throws {NotFoundError} 当用户不存在时
   */
  async deleteUser(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('用户');
    }

    await user.destroy();
  }

  /**
   * 获取用户收藏列表
   * @param {number} userId - 用户ID
   * @returns {Promise<Array>} 收藏列表
   */
  async getUserFavorites(userId) {
    // TODO: 实现真实的收藏查询逻辑
    // 目前返回模拟数据，后续需要替换为真实数据库查询
    return [
      {
        id: 101,
        name: '收藏景点1',
        location: '示例省份示例城市',
        image: '/images/attraction1.jpg'
      },
      {
        id: 102,
        name: '收藏景点2',
        location: '示例省份示例城市',
        image: '/images/attraction2.jpg'
      }
    ];
  }

  /**
   * 获取用户评价列表
   * @param {number} userId - 用户ID
   * @returns {Promise<Array>} 评价列表
   */
  async getUserReviews(userId) {
    const ratings = await Rating.findAll({
      where: { userId },
      include: [
        {
          model: Attraction,
          attributes: ['id', 'name', 'image']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return ratings.map(rating => ({
      id: rating.id,
      attractionId: rating.attractionId,
      attractionName: rating.Attraction ? rating.Attraction.name : '未知景点',
      rating: rating.rating,
      content: rating.comment || '',
      date: rating.createdAt
    }));
  }
}

module.exports = new UserService(); 