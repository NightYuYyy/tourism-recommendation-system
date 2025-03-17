const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Attraction = require('./Attraction');

/**
 * 收藏模型
 * 用于存储用户对景点的收藏记录
 */
const Favorite = sequelize.define('Favorite', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '收藏ID，主键，自增'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    comment: '用户ID，关联Users表的外键'
  },
  attractionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Attraction,
      key: 'id'
    },
    comment: '景点ID，关联Attractions表的外键'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: '收藏创建时间'
  }
}, {
  underscored: true,
  timestamps: true,
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'attraction_id'],
      comment: '确保用户对同一景点只能收藏一次'
    }
  ]
});

/**
 * 用户与收藏的一对多关系
 * 一个用户可以收藏多个景点
 */
User.hasMany(Favorite, { foreignKey: 'userId' });
Favorite.belongsTo(User, { foreignKey: 'userId' });

/**
 * 景点与收藏的一对多关系
 * 一个景点可以被多个用户收藏
 */
Attraction.hasMany(Favorite, { foreignKey: 'attractionId' });
Favorite.belongsTo(Attraction, { foreignKey: 'attractionId' });

module.exports = Favorite; 