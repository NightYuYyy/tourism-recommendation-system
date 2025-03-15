const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Attraction = require('./Attraction');

const Rating = sequelize.define('Rating', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    field: 'user_id'
  },
  attractionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Attractions',
      key: 'id'
    },
    field: 'attraction_id'
  },
  rating: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'approved'
  },
  moderationReason: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'moderation_reason'
  }
}, {
  tableName: 'ratings',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'attraction_id']
    }
  ],
  hooks: {
    afterCreate: async (rating) => {
      await Attraction.updateRating(rating.attractionId);
    },
    afterUpdate: async (rating) => {
      await Attraction.updateRating(rating.attractionId);
    },
    afterDestroy: async (rating) => {
      await Attraction.updateRating(rating.attractionId);
    }
  }
});

// 建立关联关系
User.hasMany(Rating, { foreignKey: 'userId' });
Rating.belongsTo(User, { foreignKey: 'userId' });

Attraction.hasMany(Rating, { foreignKey: 'attractionId' });
Rating.belongsTo(Attraction, { foreignKey: 'attractionId' });

module.exports = Rating;