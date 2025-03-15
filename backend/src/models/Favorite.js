const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Attraction = require('./Attraction');

const Favorite = sequelize.define('Favorite', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  attractionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Attraction,
      key: 'id'
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  underscored: true,
  timestamps: true,
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'attraction_id']
    }
  ]
});

// 设置关联关系
User.hasMany(Favorite, { foreignKey: 'userId' });
Favorite.belongsTo(User, { foreignKey: 'userId' });

Attraction.hasMany(Favorite, { foreignKey: 'attractionId' });
Favorite.belongsTo(Attraction, { foreignKey: 'attractionId' });

module.exports = Favorite; 