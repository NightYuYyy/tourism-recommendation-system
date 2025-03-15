const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rating = sequelize.define('Rating', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  attractionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'attraction_id'
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comment: {
    type: DataTypes.TEXT
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('visible', 'hidden', 'pending'),
    defaultValue: 'visible'
  }
}, {
  tableName: 'ratings',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'attraction_id']
    }
  ],
  hooks: {
    afterCreate: async (rating) => {
      const Attraction = require('./Attraction');
      await Attraction.updateRating(rating.attractionId);
    },
    afterUpdate: async (rating) => {
      const Attraction = require('./Attraction');
      await Attraction.updateRating(rating.attractionId);
    }
  }
});

module.exports = Rating;