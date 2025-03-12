# 旅游景点推荐系统

基于 Vue3 和 Node.js 的旅游景点推荐系统，使用协同过滤算法实现个性化推荐。

## 技术栈

### 前端
- Vue 3
- Vue Router
- Vuex
- Element Plus
- LESS
- Axios
- ECharts

### 后端
- Node.js
- Express
- Sequelize
- MySQL
- Redis
- JWT

## 主要功能

- 用户认证
  - 登录/注册
  - JWT 认证
  - 密码加密
  
- 景点管理
  - 景点列表展示
  - 景点详情
  - 景点搜索和筛选
  - 景点评分和评论
  
- 推荐系统
  - 基于协同过滤的个性化推荐
  - 热门景点推荐
  - 相似景点推荐
  - 推荐反馈
  
- 用户中心
  - 个人信息管理
  - 评分历史
  - 收藏管理

## 项目结构

```
tourism-recommendation-system/
├── frontend/                # 前端项目
│   ├── src/
│   │   ├── assets/         # 静态资源
│   │   ├── components/     # 公共组件
│   │   ├── router/         # 路由配置
│   │   ├── store/          # Vuex状态管理
│   │   ├── styles/         # 全局样式
│   │   ├── utils/          # 工具函数
│   │   ├── views/          # 页面组件
│   │   └── App.vue         # 根组件
│   └── package.json        # 前端依赖
│
├── backend/                 # 后端项目
│   ├── src/
│   │   ├── config/         # 配置文件
│   │   ├── controllers/    # 控制器
│   │   ├── middleware/     # 中间件
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # 路由定义
│   │   ├── utils/          # 工具函数
│   │   └── app.js         # 应用入口
│   └── package.json        # 后端依赖
│
├── docker-compose.yml      # Docker 配置
└── README.md              # 项目说明
```

## 安装和运行

1. 克隆项目
```bash
git clone https://github.com/NightYuYyy/tourism-recommendation-system.git
cd tourism-recommendation-system
```

2. 安装依赖
```bash
# 前端依赖
cd frontend
npm install

# 后端依赖
cd ../backend
npm install
```

3. 配置环境变量
```bash
# 后端配置
cp .env.example .env
# 编辑 .env 文件，配置数据库等信息
```

4. 启动服务
```bash
# 开发模式
# 前端
cd frontend
npm run dev

# 后端
cd backend
npm run dev

# 使用 Docker
docker-compose up
```

## API 文档

详细的 API 文档请参考 [API文档](docs/api.md)

## 数据库设计

详细的数据库设计请参考 [数据库设计文档](docs/database.md)

## 算法说明

本项目使用协同过滤算法进行个性化推荐，主要步骤包括：

1. 用户相似度计算（皮尔逊系数）
2. 基于用户的协同过滤推荐
3. 结果优化和排序

详细的算法说明请参考 [算法文档](docs/algorithm.md)

## 贡献指南

1. Fork 本仓库
2. 创建新的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详细信息