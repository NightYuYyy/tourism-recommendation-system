const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
const authRoutes = require('./routes/authRoutes');
const attractionRoutes = require('./routes/attractionRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

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