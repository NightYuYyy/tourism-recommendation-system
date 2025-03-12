const Rating = require('../models/Rating');
const User = require('../models/User');
const Attraction = require('../models/Attraction');
const { Op } = require('sequelize');

// 计算两个用户之间的相似度（使用皮尔逊相关系数）
const calculateUserSimilarity = async (user1Ratings, user2Ratings) => {
  const commonAttractions = user1Ratings.filter(r1 => 
    user2Ratings.some(r2 => r2.attractionId === r1.attractionId)
  );

  if (commonAttractions.length < 3) {
    return 0;
  }

  const user1Scores = commonAttractions.map(r => r.score);
  const user2Scores = commonAttractions.map(r => {
    const rating = user2Ratings.find(r2 => r2.attractionId === r.attractionId);
    return rating.score;
  });

  const avg1 = user1Scores.reduce((a, b) => a + b, 0) / user1Scores.length;
  const avg2 = user2Scores.reduce((a, b) => a + b, 0) / user2Scores.length;

  let numerator = 0;
  let denominator1 = 0;
  let denominator2 = 0;

  for (let i = 0; i < user1Scores.length; i++) {
    const diff1 = user1Scores[i] - avg1;
    const diff2 = user2Scores[i] - avg2;
    numerator += diff1 * diff2;
    denominator1 += diff1 * diff1;
    denominator2 += diff2 * diff2;
  }

  if (denominator1 === 0 || denominator2 === 0) {
    return 0;
  }

  return numerator / Math.sqrt(denominator1 * denominator2);
};

// 找到与目标用户最相似的用户
const calculateSimilarUsers = async (userId) => {
  // 获取目标用户的评分
  const userRatings = await Rating.findAll({
    where: { userId }
  });

  // 获取所有其他用户的评分
  const otherUsers = await User.findAll({
    where: {
      id: { [Op.ne]: userId }
    },
    include: [{
      model: Rating
    }]
  });

  // 计算相似度
  const similarities = await Promise.all(
    otherUsers.map(async (otherUser) => {
      const similarity = await calculateUserSimilarity(
        userRatings,
        otherUser.Ratings
      );
      return {
        userId: otherUser.id,
        similarity
      };
    })
  );

  // 返回相似度最高的用户（相似度 > 0.3）
  return similarities
    .filter(s => s.similarity > 0.3)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 10);
};

// 基于相似用户生成推荐
const getRecommendations = async (userId, similarUsers) => {
  // 获取用户已评分的景点
  const userRatedAttractions = await Rating.findAll({
    where: { userId },
    attributes: ['attractionId']
  });
  const ratedAttractionIds = userRatedAttractions.map(r => r.attractionId);

  // 获取相似用户喜欢的景点（评分 >= 4）
  const recommendedAttractions = await Rating.findAll({
    where: {
      userId: similarUsers.map(u => u.userId),
      score: { [Op.gte]: 4 },
      attractionId: { [Op.notIn]: ratedAttractionIds }
    },
    include: [{
      model: Attraction,
      attributes: ['id', 'name', 'description', 'images', 'averageRating', 'category', 'tags']
    }],
    group: ['attractionId'],
    having: Sequelize.literal('COUNT(DISTINCT userId) >= 2')
  });

  // 计算推荐分数
  const recommendations = recommendedAttractions.map(rating => {
    const recommendingUsers = similarUsers.filter(u => 
      rating.userId === u.userId
    );
    
    const recommendationScore = recommendingUsers.reduce(
      (score, user) => score + user.similarity,
      0
    );

    return {
      attraction: rating.Attraction,
      score: recommendationScore
    };
  });

  // 按推荐分数排序并返回前20个推荐
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map(r => r.attraction);
};

module.exports = {
  calculateUserSimilarity,
  calculateSimilarUsers,
  getRecommendations
};