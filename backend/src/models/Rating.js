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
  score: {
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
  visitDate: {
    type: DataTypes.DATE
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['userId', 'attractionId']
    }
  ],
  hooks: {
    afterCreate: async (rating) => {
      await updateAttractionRating(rating.attractionId);
    },
    afterUpdate: async (rating) => {
      await updateAttractionRating(rating.attractionId);
    }
  }
});

// 关联关系
Rating.belongsTo(User);
Rating.belongsTo(Attraction);

// 更新景点平均评分的辅助函数
async function updateAttractionRating(attractionId) {
  const ratings = await Rating.findAll({
    where: { attractionId }
  });
  
  const totalScore = ratings.reduce((sum, rating) => sum + rating.score, 0);
  const averageRating = totalScore / ratings.length;
  
  await Attraction.update({
    averageRating,
    totalRatings: ratings.length
  }, {
    where: { id: attractionId }
  });
}

module.exports = Rating;