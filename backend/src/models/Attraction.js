const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attraction = sequelize.define('Attraction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8)
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8)
  },
  address: {
    type: DataTypes.STRING
  },
  city: {
    type: DataTypes.STRING
  },
  province: {
    type: DataTypes.STRING
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  price: {
    type: DataTypes.DECIMAL(10, 2)
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  openingHours: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  avgRating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },
  ratingCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  visitCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'pending'),
    defaultValue: 'active'
  }
}, {
  tableName: 'attractions',
  underscored: true
});

// 类方法
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

// 更新景点评分
Attraction.updateRating = async function(attractionId) {
  const result = await sequelize.query(`
    SELECT AVG(rating) as avgRating, COUNT(*) as ratingCount
    FROM ratings
    WHERE attraction_id = ? AND status = 'visible'
  `, {
    replacements: [attractionId],
    type: sequelize.QueryTypes.SELECT
  });

  if (result && result[0]) {
    await this.update({
      avgRating: result[0].avgRating || 0,
      ratingCount: result[0].ratingCount || 0
    }, {
      where: { id: attractionId }
    });
  }
};

module.exports = Attraction;