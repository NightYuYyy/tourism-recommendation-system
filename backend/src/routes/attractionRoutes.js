const express = require('express');
const router = express.Router();
const Attraction = require('../models/Attraction');
const Rating = require('../models/Rating');
const auth = require('../middleware/auth');

// 获取景点列表
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      sort = 'averageRating',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.name = {
        [Op.like]: `%${search}%`
      };
    }

    const attractions = await Attraction.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sort, order]],
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    });

    res.json({
      total: attractions.count,
      pages: Math.ceil(attractions.count / limit),
      currentPage: parseInt(page),
      data: attractions.rows
    });
  } catch (error) {
    console.error('Get attractions error:', error);
    res.status(500).json({ message: '服务器错误' });
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