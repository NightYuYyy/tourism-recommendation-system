const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * 推荐模型
 * 用于存储系统为用户生成的景点推荐记录
 * 包含不同推荐算法的结果和用户反馈
 */
const Recommendation = sequelize.define('Recommendation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '推荐ID，主键，自增'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    comment: '用户ID，关联Users表的外键'
  },
  attractionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'attraction_id',
    comment: '景点ID，关联Attractions表的外键'
  },
  score: {
    type: DataTypes.DECIMAL(4, 3),
    allowNull: false,
    comment: '推荐分数，范围0-1，精确到小数点后3位'
  },
  algorithmType: {
    type: DataTypes.ENUM('cf', 'content', 'hybrid'),
    allowNull: false,
    comment: '推荐算法类型：cf-协同过滤，content-基于内容，hybrid-混合推荐'
  },
  reason: {
    type: DataTypes.STRING,
    comment: '推荐原因，解释为什么推荐该景点'
  },
  clicked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '用户是否点击过该推荐'
  },
  feedback: {
    type: DataTypes.ENUM('like', 'dislike', 'neutral'),
    allowNull: true,
    comment: '用户反馈：like-喜欢，dislike-不喜欢，neutral-中立'
  }
}, {
  tableName: 'recommendations',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'attraction_id', 'algorithm_type'],
      comment: '确保同一算法对同一用户的同一景点只有一条推荐记录'
    }
  ]
});

module.exports = Recommendation; 