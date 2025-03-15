const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const User = require('../models/User');

// 登录路由
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 查找用户
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: '用户不存在' });
    }
    
    // 验证密码
    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({ message: '密码错误' });
    }
    
    // 生成 JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 注册路由
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // 检查用户是否已存在
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });
    
    if (existingUser) {
      return res.status(400).json({ message: '用户名或邮箱已存在' });
    }
    
    // 创建新用户
    const user = await User.create({
      username,
      email,
      password
    });
    
    // 生成 JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取当前用户信息
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未提供认证令牌' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;