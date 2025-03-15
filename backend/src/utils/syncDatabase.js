const sequelize = require('../config/database');
const User = require('../models/User');
const Attraction = require('../models/Attraction');
const Rating = require('../models/Rating');
const Recommendation = require('../models/Recommendation');

// 定义模型之间的关联关系
function defineAssociations() {
  // User - Rating 关联
  User.hasMany(Rating, { foreignKey: 'user_id' });
  Rating.belongsTo(User, { foreignKey: 'user_id' });

  // Attraction - Rating 关联
  Attraction.hasMany(Rating, { foreignKey: 'attraction_id' });
  Rating.belongsTo(Attraction, { foreignKey: 'attraction_id' });

  // User - Recommendation 关联
  User.hasMany(Recommendation, { foreignKey: 'user_id' });
  Recommendation.belongsTo(User, { foreignKey: 'user_id' });

  // Attraction - Recommendation 关联
  Attraction.hasMany(Recommendation, { foreignKey: 'attraction_id' });
  Recommendation.belongsTo(Attraction, { foreignKey: 'attraction_id' });
}

// 同步数据库
async function syncDatabase(force = false, alter = false) {
  try {
    defineAssociations();
    
    const options = {};
    
    if (force) {
      // force: true 将删除现有表并重新创建
      options.force = true;
      console.log('警告: 将删除所有现有表并重新创建');
    } else if (alter) {
      // alter: true 将尝试修改现有表以匹配模型
      options.alter = true;
      console.log('将尝试修改现有表结构以匹配模型');
    }
    
    await sequelize.sync(options);
    
    console.log('数据库同步完成');
    return { success: true, message: '数据库同步完成', options };
  } catch (error) {
    console.error('数据库同步失败:', error);
    return { success: false, message: error.message };
  }
}

// 检查数据库连接
async function checkDatabaseConnection() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error);
    return false;
  }
}

// 获取数据库表信息
async function getDatabaseInfo() {
  try {
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('数据库中的表:', tables);
    
    const tableInfo = {};
    for (const table of tables) {
      const columns = await sequelize.getQueryInterface().describeTable(table);
      tableInfo[table] = columns;
    }
    
    return { tables, tableInfo };
  } catch (error) {
    console.error('获取数据库信息失败:', error);
    return { error: error.message };
  }
}

// 创建模拟数据
async function createMockData() {
  try {
    console.log('开始创建模拟数据...');
    
    // 创建管理员用户
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });
    
    // 创建普通用户
    const normalUser = await User.create({
      username: 'user',
      email: 'user@example.com',
      password: 'user123',
      role: 'user'
    });
    
    // 创建景点数据
    const attractions = await Attraction.bulkCreate([
      {
        name: '故宫博物院',
        description: '中国明清两代的皇家宫殿，世界上现存规模最大、保存最为完整的木质结构古建筑之一。',
        latitude: 39.9163447,
        longitude: 116.3971546,
        address: '北京市东城区景山前街4号',
        city: '北京',
        province: '北京',
        images: JSON.stringify(['https://example.com/forbidden_city1.jpg', 'https://example.com/forbidden_city2.jpg']),
        price: 60.00,
        tags: JSON.stringify(['历史', '文化', '建筑', '博物馆']),
        openingHours: JSON.stringify({
          monday: '8:30-17:00',
          tuesday: '8:30-17:00',
          wednesday: '8:30-17:00',
          thursday: '8:30-17:00',
          friday: '8:30-17:00',
          saturday: '8:30-17:00',
          sunday: '8:30-17:00'
        }),
        status: 'active'
      },
      {
        name: '长城',
        description: '中国古代的伟大防御工程，是世界上最伟大的建筑之一。',
        latitude: 40.4319077,
        longitude: 116.5703749,
        address: '北京市怀柔区',
        city: '北京',
        province: '北京',
        images: JSON.stringify(['https://example.com/great_wall1.jpg', 'https://example.com/great_wall2.jpg']),
        price: 45.00,
        tags: JSON.stringify(['历史', '建筑', '自然', '世界遗产']),
        openingHours: JSON.stringify({
          monday: '8:00-17:00',
          tuesday: '8:00-17:00',
          wednesday: '8:00-17:00',
          thursday: '8:00-17:00',
          friday: '8:00-17:00',
          saturday: '8:00-17:00',
          sunday: '8:00-17:00'
        }),
        status: 'active'
      },
      {
        name: '西湖',
        description: '中国浙江省杭州市的著名景点，以其美丽的湖光山色和众多的历史文化古迹闻名。',
        latitude: 30.2590952,
        longitude: 120.1388662,
        address: '浙江省杭州市西湖区',
        city: '杭州',
        province: '浙江',
        images: JSON.stringify(['https://example.com/west_lake1.jpg', 'https://example.com/west_lake2.jpg']),
        price: 0.00,
        tags: JSON.stringify(['自然', '湖泊', '文化', '世界遗产']),
        openingHours: JSON.stringify({
          monday: '全天开放',
          tuesday: '全天开放',
          wednesday: '全天开放',
          thursday: '全天开放',
          friday: '全天开放',
          saturday: '全天开放',
          sunday: '全天开放'
        }),
        status: 'active'
      }
    ]);
    
    // 创建评分数据
    await Rating.bulkCreate([
      {
        user_id: normalUser.id,
        attraction_id: attractions[0].id,
        rating: 5,
        comment: '非常壮观的历史建筑，值得一游！',
        images: JSON.stringify(['https://example.com/user_review1.jpg']),
        status: 'visible'
      },
      {
        user_id: normalUser.id,
        attraction_id: attractions[1].id,
        rating: 4,
        comment: '景色很美，但人有点多。',
        images: JSON.stringify([]),
        status: 'visible'
      }
    ]);
    
    // 创建推荐数据
    await Recommendation.bulkCreate([
      {
        user_id: normalUser.id,
        attraction_id: attractions[2].id,
        score: 0.95,
        algorithmType: 'content',
        reason: '根据您对历史景点的兴趣推荐',
        clicked: false
      }
    ]);
    
    console.log('模拟数据创建成功');
    return { success: true, message: '模拟数据创建成功' };
  } catch (error) {
    console.error('创建模拟数据失败:', error);
    return { success: false, message: error.message };
  }
}

module.exports = {
  syncDatabase,
  checkDatabaseConnection,
  getDatabaseInfo,
  defineAssociations,
  createMockData
}; 