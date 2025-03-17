const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const User = require('../models/User');
const {
  AuthenticationError,
  ValidationError,
  NotFoundError
} = require('../utils/errors');

/**
 * 认证服务类
 * 处理所有与认证相关的业务逻辑
 */
class AuthService {
  /**
   * 用户登录
   * @param {string} email - 用户邮箱
   * @param {string} password - 用户密码
   * @returns {Promise<{token: string, user: Object}>}
   * @throws {AuthenticationError} 当用户不存在或密码错误时
   */
  async login(email, password) {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('用户不存在');
    }

    const isValid = await user.validatePassword(password);
    if (!isValid) {
      throw new AuthenticationError('密码错误');
    }

    const token = this.generateToken(user);
    return {
      token,
      user: this.sanitizeUser(user)
    };
  }

  /**
   * 用户注册
   * @param {Object} userData - 用户注册数据
   * @param {string} userData.username - 用户名
   * @param {string} userData.email - 邮箱
   * @param {string} userData.password - 密码
   * @returns {Promise<{token: string, user: Object}>}
   * @throws {ValidationError} 当数据验证失败时
   */
  async register(userData) {
    const { username, email, password } = userData;

    // 验证数据
    if (!username || !email || !password) {
      throw new ValidationError('所有字段都是必填的');
    }

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      throw new ValidationError('用户名或邮箱已存在');
    }

    // 创建新用户
    const user = await User.create(userData);
    const token = this.generateToken(user);

    return {
      token,
      user: this.sanitizeUser(user)
    };
  }

  /**
   * 获取当前用户信息
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>}
   * @throws {NotFoundError} 当用户不存在时
   */
  async getCurrentUser(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('用户');
    }
    return this.sanitizeUser(user);
  }

  /**
   * 更新用户信息
   * @param {number} userId - 用户ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>}
   * @throws {NotFoundError} 当用户不存在时
   * @throws {ValidationError} 当数据验证失败时
   */
  async updateUser(userId, updateData) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('用户');
    }

    // 如果要更新邮箱，检查是否已存在
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({
        where: { email: updateData.email }
      });
      if (existingUser) {
        throw new ValidationError('该邮箱已被使用');
      }
    }

    await user.update(updateData);
    return this.sanitizeUser(user);
  }

  /**
   * 修改密码
   * @param {number} userId - 用户ID
   * @param {string} currentPassword - 当前密码
   * @param {string} newPassword - 新密码
   * @returns {Promise<void>}
   * @throws {NotFoundError} 当用户不存在时
   * @throws {AuthenticationError} 当当前密码错误时
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('用户');
    }

    const isValid = await user.validatePassword(currentPassword);
    if (!isValid) {
      throw new AuthenticationError('当前密码错误');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await user.update({ password: hashedPassword });
  }

  /**
   * 生成 JWT token
   * @param {Object} user - 用户对象
   * @returns {string} JWT token
   * @private
   */
  generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
  }

  /**
   * 清理用户数据（移除敏感信息）
   * @param {Object} user - 用户对象
   * @returns {Object} 清理后的用户数据
   * @private
   */
  sanitizeUser(user) {
    const { id, username, email, role, preferences } = user;
    return { id, username, email, role, preferences };
  }
}

module.exports = new AuthService(); 