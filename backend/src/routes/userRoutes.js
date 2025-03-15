const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { Op } = require('sequelize');
const Attraction = require('../models/Attraction');
const Rating = require('../models/Rating');

// 获取用户列表（需管理员权限）
router.get('/', [auth, adminAuth], async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const { count, rows } = await User.findAndCountAll({
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      users: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取用户收藏列表
router.get('/favorites', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('获取收藏，用户ID:', userId);
    
    // 假设有一个Favorite模型或关联表
    // 这里简化处理，直接返回模拟数据
    // 实际实现应该查询数据库
    
    const favorites = [
      {
        id: 101,
        name: '收藏景点1',
        location: '示例省份示例城市',
        image: '/images/attraction1.jpg'
      },
      {
        id: 102,
        name: '收藏景点2',
        location: '示例省份示例城市',
        image: '/images/attraction2.jpg'
      }
    ];
    
    res.json(favorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取用户评价列表
router.get('/reviews', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('获取评价，用户ID:', userId);
    
    // 查询用户的所有评分记录
    const ratings = await Rating.findAll({
      where: { userId },
      include: [
        {
          model: Attraction,
          attributes: ['id', 'name', 'image']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // 格式化响应数据
    const reviews = ratings.map(rating => ({
      id: rating.id,
      attractionId: rating.attractionId,
      attractionName: rating.Attraction ? rating.Attraction.name : '未知景点',
      rating: rating.rating,
      content: rating.comment || '',
      date: rating.createdAt
    }));
    
    res.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取用户详细信息
router.get('/:id', auth, async (req, res) => {
  try {
    // 只允许用户查看自己的信息或管理员查看任何用户
    if (req.user.id !== parseInt(req.params.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: '没有权限查看其他用户信息' });
    }
    
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新用户信息
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, email, phone } = req.body;
    const userId = req.user.id;
    
    // 检查用户名和邮箱是否已被其他用户使用
    if (username) {
      const existingUser = await User.findOne({
        where: {
          username,
          id: { [Op.ne]: userId }
        }
      });
      
      if (existingUser) {
        return res.status(400).json({ message: '用户名已被使用' });
      }
    }
    
    if (email) {
      const existingUser = await User.findOne({
        where: {
          email,
          id: { [Op.ne]: userId }
        }
      });
      
      if (existingUser) {
        return res.status(400).json({ message: '邮箱已被使用' });
      }
    }
    
    // 更新用户信息
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 只更新提供的字段
    if (username) user.username = username;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    
    await user.save();
    
    // 返回更新后的用户信息（不包含密码）
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return res.status(400).json({ 
        message: '验证错误', 
        errors: validationErrors 
      });
    }
    
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新用户偏好设置
router.put('/preferences', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = req.body;
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 更新偏好设置
    user.preferences = preferences;
    await user.save();
    
    res.json(user.preferences);
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新用户密码
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: '当前密码和新密码不能为空' });
    }
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 验证当前密码
    const isValid = await user.validatePassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({ message: '当前密码不正确' });
    }
    
    // 更新密码
    user.password = newPassword;
    await user.save();
    
    res.json({ message: '密码更新成功' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除用户账号（需管理员权限）
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    await user.destroy();
    
    res.json({ message: '用户账号已删除' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router; 