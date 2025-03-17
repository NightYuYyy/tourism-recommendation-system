const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * 认证中间件
 * 验证请求中的JWT token并解析用户信息
 */
exports.authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: '未提供认证令牌' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
      if (err) {
        return res.status(403).json({ message: '无效的认证令牌' });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 角色验证中间件
 * 检查用户是否具有特定角色
 * @param {string[]} roles - 允许的角色列表
 */
exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: '未经认证的请求' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: '没有足够的权限' });
    }

    next();
  };
};

module.exports = exports;