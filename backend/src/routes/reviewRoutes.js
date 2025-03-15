const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const Attraction = require('../models/Attraction');
const User = require('../models/User');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// 获取评论列表
router.get('/', async (req, res) => {
  try {
    const { attractionId, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    if (attractionId) {
      whereClause.attractionId = attractionId;
    }
    
    const { count, rows } = await Rating.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ['id', 'username']
        },
        {
          model: Attraction,
          attributes: ['id', 'name']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    // 格式化响应数据
    const reviews = rows.map(rating => ({
      id: rating.id,
      attractionId: rating.attractionId,
      attractionName: rating.Attraction ? rating.Attraction.name : '未知景点',
      userId: rating.userId,
      username: rating.User ? rating.User.username : '未知用户',
      rating: rating.rating,
      content: rating.comment || '',
      date: rating.createdAt
    }));
    
    res.json({
      reviews,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取单个评论
router.get('/:id', async (req, res) => {
  try {
    const reviewId = req.params.id;
    
    const rating = await Rating.findByPk(reviewId, {
      include: [
        {
          model: User,
          attributes: ['id', 'username']
        },
        {
          model: Attraction,
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!rating) {
      return res.status(404).json({ message: '评论不存在' });
    }
    
    const review = {
      id: rating.id,
      attractionId: rating.attractionId,
      attractionName: rating.Attraction ? rating.Attraction.name : '未知景点',
      userId: rating.userId,
      username: rating.User ? rating.User.username : '未知用户',
      rating: rating.rating,
      content: rating.comment || '',
      date: rating.createdAt
    };
    
    res.json(review);
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新评论
router.put('/:id', auth, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user.id;
    const { rating, content } = req.body;
    
    const ratingRecord = await Rating.findOne({
      where: { id: reviewId, userId }
    });
    
    if (!ratingRecord) {
      return res.status(404).json({ message: '评论不存在或无权限修改' });
    }
    
    // 更新评分和评论内容
    if (rating !== undefined) ratingRecord.rating = rating;
    if (content !== undefined) ratingRecord.comment = content;
    
    await ratingRecord.save();
    
    // 更新景点平均评分
    const attraction = await Attraction.findByPk(ratingRecord.attractionId);
    if (attraction) {
      const ratings = await Rating.findAll({
        where: { attractionId: ratingRecord.attractionId },
        attributes: ['rating']
      });
      
      const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      attraction.avgRating = avgRating;
      await attraction.save();
    }
    
    res.json({
      id: ratingRecord.id,
      attractionId: ratingRecord.attractionId,
      userId: ratingRecord.userId,
      rating: ratingRecord.rating,
      content: ratingRecord.comment,
      date: ratingRecord.updatedAt
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除评论
router.delete('/:id', auth, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user.id;
    
    const ratingRecord = await Rating.findByPk(reviewId);
    
    if (!ratingRecord) {
      return res.status(404).json({ message: '评论不存在' });
    }
    
    // 检查权限（用户只能删除自己的评论，管理员可以删除任何评论）
    if (ratingRecord.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权限删除该评论' });
    }
    
    const attractionId = ratingRecord.attractionId;
    
    await ratingRecord.destroy();
    
    // 更新景点平均评分
    const attraction = await Attraction.findByPk(attractionId);
    if (attraction) {
      const ratings = await Rating.findAll({
        where: { attractionId },
        attributes: ['rating']
      });
      
      if (ratings.length > 0) {
        const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
        attraction.avgRating = avgRating;
      } else {
        attraction.avgRating = 0;
      }
      
      await attraction.save();
    }
    
    res.json({ message: '评论已删除' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 管理员审核评论
router.put('/:id/moderate', [auth, adminAuth], async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { status, reason } = req.body;
    
    const ratingRecord = await Rating.findByPk(reviewId);
    
    if (!ratingRecord) {
      return res.status(404).json({ message: '评论不存在' });
    }
    
    // 更新评论状态
    ratingRecord.status = status;
    ratingRecord.moderationReason = reason;
    
    await ratingRecord.save();
    
    res.json({
      id: ratingRecord.id,
      status: ratingRecord.status,
      moderationReason: ratingRecord.moderationReason
    });
  } catch (error) {
    console.error('Moderate review error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router; 