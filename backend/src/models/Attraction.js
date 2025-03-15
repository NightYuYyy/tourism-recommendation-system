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
  underscored: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

// 类方法
Attraction.findNearby = async function(latitude, longitude, radius) {
  const query = `
    SELECT id, name, 
           SQRT(POW(latitude - ${latitude}, 2) + POW(longitude - ${longitude}, 2)) * 111.32 as distance
    FROM attractions
    WHERE SQRT(POW(latitude - ${latitude}, 2) + POW(longitude - ${longitude}, 2)) * 111.32 <= ${radius}
    ORDER BY distance;
  `;
  
  return await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
};

module.exports = Attraction;