const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Attraction = require('./Attraction');

/**
 * 评分模型
 * 用于存储用户对景点的评分和评论信息
 */
const Rating = sequelize.define('Rating', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '评分ID，主键，自增'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    field: 'user_id',
    comment: '用户ID，关联Users表的外键'
  },
  attractionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Attractions',
      key: 'id'
    },
    field: 'attraction_id',
    comment: '景点ID，关联Attractions表的外键'
  },
  rating: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    },
    comment: '评分值，范围1-5，支持小数'
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '评论内容，可选'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'approved',
    comment: '评论状态：pending-待审核，approved-已通过，rejected-已拒绝'
  },
  moderationReason: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'moderation_reason',
    comment: '审核原因，当状态为rejected时记录拒绝原因'
  }
}, {
  tableName: 'ratings',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'attraction_id'],
      comment: '确保每个用户对同一景点只能评分一次'
    }
  ],
  hooks: {
    // 评分创建后更新景点的平均评分
    afterCreate: async (rating) => {
      await Attraction.updateRating(rating.attractionId);
    },
    // 评分更新后更新景点的平均评分
    afterUpdate: async (rating) => {
      await Attraction.updateRating(rating.attractionId);
    },
    // 评分删除后更新景点的平均评分
    afterDestroy: async (rating) => {
      await Attraction.updateRating(rating.attractionId);
    }
  }
});

// 建立关联关系
/**
 * 用户与评分的一对多关系
 * 一个用户可以有多个评分记录
 */
User.hasMany(Rating, { foreignKey: 'userId' });
Rating.belongsTo(User, { foreignKey: 'userId' });

/**
 * 景点与评分的一对多关系
 * 一个景点可以有多个评分记录
 */
Attraction.hasMany(Rating, { foreignKey: 'attractionId' });
Rating.belongsTo(Attraction, { foreignKey: 'attractionId' });

module.exports = Rating;