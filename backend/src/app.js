const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/errorHandler');

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// CORS配置
const corsOptions = {
  origin: function(origin, callback) {
    // 允许所有来源，或者你可以设置具体的域名列表
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// 基础中间件
app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制每个IP 100个请求
});
app.use(limiter);

// 路由
const authRoutes = require('./routes/authRoutes');
const attractionRoutes = require('./routes/attractionRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const systemRoutes = require('./routes/systemRoutes');
const userRoutes = require('./routes/userRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

// 添加一个测试路由
app.get('/api/test', (req, res) => {
  res.json({ message: '后端服务器正常运行' });
});

app.use('/api/auth', authRoutes);
app.use('/api/attractions', attractionRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reviews', reviewRoutes);

// 404处理
app.use((req, res, next) => {
  res.status(404).json({
    message: '请求的资源不存在'
  });
});

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

module.exports = app;