const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * 用户模型
 * 用于存储系统中的用户信息，包括普通用户和管理员
 */
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '用户ID，主键，自增'
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 30]
    },
    comment: '用户名，唯一，长度3-30个字符'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    },
    comment: '用户邮箱，唯一，需要符合邮箱格式'
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '用户密码，存储加密后的哈希值'
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
    comment: '用户角色：user-普通用户，admin-管理员'
  },
  preferences: {
    type: DataTypes.JSON,
    defaultValue: {},
    comment: '用户偏好设置，存储为JSON格式，包含用户的个性化设置'
  }
}, {
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

/**
 * 验证用户密码
 * @param {string} password - 待验证的密码
 * @returns {Promise<boolean>} - 返回密码是否匹配
 */
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

/**
 * 通过邮箱查找用户
 * @param {string} email - 用户邮箱
 * @returns {Promise<User>} - 返回查找到的用户实例
 */
User.findByEmail = async function(email) {
  return await User.findOne({ where: { email } });
};

module.exports = User;