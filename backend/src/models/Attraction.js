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
  location: {
    type: DataTypes.GEOMETRY('POINT'),
    allowNull: false
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
  openingHours: {
    type: DataTypes.JSON
  },
  ticketPrice: {
    type: DataTypes.DECIMAL(10, 2)
  },
  category: {
    type: DataTypes.STRING
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  averageRating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0
  },
  totalRatings: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'maintenance'),
    defaultValue: 'active'
  }
}, {
  indexes: [
    {
      type: 'SPATIAL',
      fields: ['location']
    }
  ]
});

// 类方法
Attraction.findNearby = async function(latitude, longitude, radius) {
  const query = `
    SELECT id, name, 
           ST_Distance_Sphere(location, ST_GeomFromText('POINT(${longitude} ${latitude})')) as distance
    FROM Attractions
    WHERE ST_Distance_Sphere(location, ST_GeomFromText('POINT(${longitude} ${latitude})')) <= ${radius}
    ORDER BY distance;
  `;
  
  return await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
};

module.exports = Attraction;