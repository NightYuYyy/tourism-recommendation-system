/**
 * 全局错误处理中间件
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // 处理 Sequelize 错误
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      message: '数据验证错误',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      message: '数据已存在',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // 处理自定义业务错误
  if (err.isBusinessError) {
    return res.status(err.statusCode || 400).json({
      message: err.message,
      code: err.code
    });
  }

  // 处理认证错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: '无效的认证令牌'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: '认证令牌已过期'
    });
  }

  // 默认错误处理
  res.status(500).json({
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = errorHandler; 