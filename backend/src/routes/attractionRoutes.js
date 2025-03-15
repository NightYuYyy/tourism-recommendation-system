const express = require('express');
const router = express.Router();
const Attraction = require('../models/Attraction');
const Rating = require('../models/Rating');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// 获取推荐景点
router.get('/featured', async (req, res) => {
  try {
    // 获取评分最高的6个景点
    const attractions = await Attraction.findAll({
      order: [['avgRating', 'DESC']],
      limit: 6,
      where: {
        status: 'active'
      },
      attributes: [
        'id', 'name', 'description', 'latitude', 'longitude', 
        'address', 'city', 'province', 'images', 'price', 
        'tags', 'avgRating', 'ratingCount'
      ]
    });

    // 处理图片数据
    const processedAttractions = attractions.map(attraction => {
      const item = attraction.toJSON();
      
      // 确保images是数组
      if (typeof item.images === 'string') {
        try {
          item.images = JSON.parse(item.images);
        } catch (e) {
          item.images = [];
        }
      }
      
      // 如果没有图片，使用默认图片
      if (!item.images || !item.images.length) {
        item.image = '/images/default-attraction.jpg';
      } else {
        item.image = item.images[0];
      }
      
      // 添加rating字段用于前端显示
      item.rating = item.avgRating;
      
      return item;
    });

    res.json(processedAttractions);
  } catch (error) {
    console.error('获取推荐景点错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取单个景点详情
router.get('/:id', async (req, res) => {
  try {
    const attraction = await Attraction.findByPk(req.params.id, {
      include: [{
        model: Rating,
        attributes: ['score', 'comment', 'visitDate'],
        include: [{
          model: User,
          attributes: ['username']
        }]
      }]
    });

    if (!attraction) {
      return res.status(404).json({ message: '景点不存在' });
    }

    res.json(attraction);
  } catch (error) {
    console.error('Get attraction detail error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取景点列表
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      sortBy = 'averageRating',
      order = 'DESC',
      minPrice = 0,
      maxPrice = 1000
    } = req.query;

    console.log('查询参数:', req.query);

    const offset = (page - 1) * limit;
    const where = {};

    // 由于数据库中没有category字段，我们可以使用tags字段进行过滤
    // if (category && category !== '') {
    //   where.category = category;
    // }

    if (search && search !== '') {
      where.name = {
        [Op.like]: `%${search}%`
      };
    }

    // 添加价格范围过滤
    if (minPrice !== undefined && maxPrice !== undefined) {
      where.price = {
        [Op.between]: [parseFloat(minPrice), parseFloat(maxPrice)]
      };
    }

    console.log('构建的查询条件:', where);

    // 检查数据库表结构已完成，不再需要
    // try {
    //   const tableInfo = await sequelize.query('DESCRIBE attractions', { type: sequelize.QueryTypes.SELECT });
    //   console.log('表结构:', tableInfo);
    // } catch (err) {
    //   console.error('获取表结构失败:', err);
    // }

    // 不再需要删除价格过滤条件
    // delete where.ticketPrice;

    const attractions = await Attraction.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy === 'rating' ? 'avgRating' : sortBy, order]],
      attributes: [
        'id', 'name', 'description', 'latitude', 'longitude', 
        'address', 'city', 'province', 'images', 'price', 
        'tags', 'avgRating', 'ratingCount', 
        'visitCount', 'status'
      ]
    });

    res.json({
      total: attractions.count,
      pages: Math.ceil(attractions.count / limit),
      currentPage: parseInt(page),
      data: attractions.rows
    });
  } catch (error) {
    console.error('获取景点列表错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 添加新景点（需要管理员权限）
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '没有权限执行此操作' });
    }

    const attraction = await Attraction.create(req.body);
    res.status(201).json(attraction);
  } catch (error) {
    console.error('Create attraction error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新景点信息（需要管理员权限）
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '没有权限执行此操作' });
    }

    const attraction = await Attraction.findByPk(req.params.id);
    if (!attraction) {
      return res.status(404).json({ message: '景点不存在' });
    }

    await attraction.update(req.body);
    res.json(attraction);
  } catch (error) {
    console.error('Update attraction error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除景点（需要管理员权限）
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '没有权限执行此操作' });
    }

    const attraction = await Attraction.findByPk(req.params.id);
    if (!attraction) {
      return res.status(404).json({ message: '景点不存在' });
    }

    await attraction.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Delete attraction error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 提交评分和评论
router.post('/:id/ratings', auth, async (req, res) => {
  try {
    const { score, comment, visitDate } = req.body;
    const attractionId = req.params.id;
    const userId = req.user.id;

    const [rating, created] = await Rating.findOrCreate({
      where: { userId, attractionId },
      defaults: { score, comment, visitDate }
    });

    if (!created) {
      await rating.update({ score, comment, visitDate });
    }

    res.status(created ? 201 : 200).json(rating);
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;