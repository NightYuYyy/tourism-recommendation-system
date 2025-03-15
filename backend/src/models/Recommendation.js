const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Recommendation = sequelize.define('Recommendation', {
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
  score: {
    type: DataTypes.DECIMAL(4, 3),
    allowNull: false
  },
  algorithmType: {
    type: DataTypes.ENUM('cf', 'content', 'hybrid'),
    allowNull: false
  },
  reason: {
    type: DataTypes.STRING
  },
  clicked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  feedback: {
    type: DataTypes.ENUM('like', 'dislike', 'neutral'),
    allowNull: true
  }
}, {
  tableName: 'recommendations',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'attraction_id', 'algorithm_type']
    }
  ]
});

module.exports = Recommendation; 