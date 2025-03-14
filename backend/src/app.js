const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

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

// 中间件
app.use(cors(corsOptions));
app.use(express.json());

// 路由
const authRoutes = require('./routes/authRoutes');
const attractionRoutes = require('./routes/attractionRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

// 添加一个测试路由
app.get('/api/test', (req, res) => {
  res.json({ message: '后端服务器正常运行' });
});

app.use('/api/auth', authRoutes);
app.use('/api/attractions', attractionRoutes);
app.use('/api/recommendations', recommendationRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: '服务器发生错误', 
    error: process.env.NODE_ENV === 'production' ? {} : err.stack 
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

module.exports = app;