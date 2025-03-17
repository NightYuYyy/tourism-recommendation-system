const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * 景点模型
 * 用于存储旅游景点的详细信息，包括位置、评分等
 */
const Attraction = sequelize.define('Attraction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '景点ID，主键，自增'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '景点名称'
  },
  description: {
    type: DataTypes.TEXT,
    comment: '景点详细描述'
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    comment: '纬度，精确到小数点后8位'
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    comment: '经度，精确到小数点后8位'
  },
  address: {
    type: DataTypes.STRING,
    comment: '景点详细地址'
  },
  city: {
    type: DataTypes.STRING,
    comment: '所在城市'
  },
  province: {
    type: DataTypes.STRING,
    comment: '所在省份'
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: '景点图片URL数组，JSON格式存储'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    comment: '门票价格，精确到分'
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: '景点标签数组，如["历史", "文化", "自然"]等'
  },
  openingHours: {
    type: DataTypes.JSON,
    defaultValue: {},
    comment: '营业时间，JSON格式存储，包含每天的开放时间'
  },
  avgRating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
    comment: '平均评分，范围0-5，精确到小数点后2位'
  },
  ratingCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '评分总数，用于计算平均评分'
  },
  visitCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '访问量统计'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'pending'),
    defaultValue: 'active',
    comment: '景点状态：active-正常，inactive-关闭，pending-待审核'
  }
}, {
  tableName: 'attractions',
  underscored: true
});

/**
 * 查找附近景点的类方法
 * @param {number} latitude - 当前位置纬度
 * @param {number} longitude - 当前位置经度
 * @param {number} radius - 搜索半径（公里），默认5公里
 * @returns {Promise<Array>} - 返回按距离排序的景点列表
 */
Attraction.findNearby = async function(latitude, longitude, radius = 5) {
  const query = `
    SELECT *, 
           (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * 
           cos(radians(longitude) - radians(?)) + sin(radians(?)) * 
           sin(radians(latitude)))) AS distance 
    FROM attractions 
    HAVING distance < ? 
    ORDER BY distance;
  `;
  
  return await sequelize.query(query, {
    replacements: [latitude, longitude, latitude, radius],
    type: sequelize.QueryTypes.SELECT
  });
};

/**
 * 更新景点评分的类方法
 * 当有新的评分添加、更新或删除时自动调用
 * @param {number} attractionId - 景点ID
 */
Attraction.updateRating = async function(attractionId) {
  try {
    const Rating = require('./Rating');
    const attraction = await this.findByPk(attractionId);
    
    if (!attraction) return;
    
    const ratings = await Rating.findAll({
      where: { attractionId },
      attributes: ['rating']
    });
    
    if (ratings.length > 0) {
      const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      attraction.avgRating = parseFloat(avgRating.toFixed(1));
    } else {
      attraction.avgRating = 0;
    }
    
    await attraction.save();
  } catch (error) {
    console.error('Error updating attraction rating:', error);
  }
};

module.exports = Attraction;