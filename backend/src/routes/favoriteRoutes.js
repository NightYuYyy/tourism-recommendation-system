const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const Attraction = require('../models/Attraction');
const auth = require('../middleware/auth');

// 添加收藏
router.post('/', auth, async (req, res) => {
  try {
    const { attractionId } = req.body;
    const userId = req.user.id;
    
    if (!attractionId) {
      return res.status(400).json({ message: '景点ID不能为空' });
    }
    
    // 检查景点是否存在
    const attraction = await Attraction.findByPk(attractionId);
    if (!attraction) {
      return res.status(404).json({ message: '景点不存在' });
    }
    
    // 检查是否已收藏
    const existingFavorite = await Favorite.findOne({
      where: { userId, attractionId }
    });
    
    if (existingFavorite) {
      return res.status(400).json({ message: '已经收藏过该景点' });
    }
    
    // 创建收藏
    const favorite = await Favorite.create({
      userId,
      attractionId
    });
    
    res.status(201).json({
      id: favorite.id,
      userId,
      attractionId,
      createdAt: favorite.createdAt
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取用户收藏列表
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Favorite.findAndCountAll({
      where: { userId },
      include: [
        {
          model: Attraction,
          attributes: ['id', 'name', 'description', 'image', 'location']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    // 格式化响应数据
    const favorites = rows.map(favorite => ({
      id: favorite.id,
      attractionId: favorite.attractionId,
      name: favorite.Attraction.name,
      description: favorite.Attraction.description,
      image: favorite.Attraction.image,
      location: favorite.Attraction.location,
      createdAt: favorite.createdAt
    }));
    
    res.json({
      favorites,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除收藏
router.delete('/:id', auth, async (req, res) => {
  try {
    const favoriteId = req.params.id;
    const userId = req.user.id;
    
    const favorite = await Favorite.findOne({
      where: { id: favoriteId, userId }
    });
    
    if (!favorite) {
      return res.status(404).json({ message: '收藏不存在或无权限删除' });
    }
    
    await favorite.destroy();
    
    res.json({ message: '收藏已删除' });
  } catch (error) {
    console.error('Delete favorite error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 检查是否已收藏
router.get('/check/:attractionId', auth, async (req, res) => {
  try {
    const attractionId = req.params.attractionId;
    const userId = req.user.id;
    
    const favorite = await Favorite.findOne({
      where: { userId, attractionId }
    });
    
    res.json({ isFavorite: !!favorite });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router; 