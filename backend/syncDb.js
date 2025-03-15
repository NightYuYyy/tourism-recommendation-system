#!/usr/bin/env node

/**
 * 数据库同步工具
 * 
 * 使用方法:
 * node syncDb.js [选项]
 * 
 * 选项:
 *   --force    删除所有表并重新创建 (危险操作)
 *   --alter    尝试修改表结构以匹配模型 (安全操作)
 *   --info     仅显示数据库信息，不进行同步
 *   --check    仅检查数据库连接
 *   --mock     创建模拟数据 (通常与 --force 一起使用)
 *   --help     显示帮助信息
 */

require('dotenv').config();
const { 
  syncDatabase, 
  checkDatabaseConnection, 
  getDatabaseInfo,
  createMockData
} = require('./src/utils/syncDatabase');

// 解析命令行参数
const args = process.argv.slice(2);
const options = {
  force: args.includes('--force'),
  alter: args.includes('--alter'),
  info: args.includes('--info'),
  check: args.includes('--check'),
  mock: args.includes('--mock'),
  help: args.includes('--help')
};

// 显示帮助信息
if (options.help) {
  console.log(`
数据库同步工具

使用方法:
  node syncDb.js [选项]

选项:
  --force    删除所有表并重新创建 (危险操作)
  --alter    尝试修改表结构以匹配模型 (安全操作)
  --info     仅显示数据库信息，不进行同步
  --check    仅检查数据库连接
  --mock     创建模拟数据 (通常与 --force 一起使用)
  --help     显示帮助信息
  `);
  process.exit(0);
}

// 主函数
async function main() {
  try {
    // 检查数据库连接
    const connected = await checkDatabaseConnection();
    if (!connected) {
      console.error('无法连接到数据库，请检查配置');
      process.exit(1);
    }

    // 仅检查连接
    if (options.check) {
      console.log('数据库连接检查完成');
      process.exit(0);
    }

    // 显示数据库信息
    if (options.info) {
      const dbInfo = await getDatabaseInfo();
      console.log('数据库信息:');
      console.log(JSON.stringify(dbInfo, null, 2));
      process.exit(0);
    }

    // 同步数据库
    console.log('开始同步数据库...');
    const result = await syncDatabase(options.force, options.alter);
    
    if (result.success) {
      console.log('✅ 数据库同步成功');
      if (result.options.force) {
        console.log('注意: 所有表已被重新创建');
      } else if (result.options.alter) {
        console.log('注意: 表结构已被修改以匹配模型');
      }
      
      // 创建模拟数据
      if (options.mock) {
        console.log('\n开始创建模拟数据...');
        const mockResult = await createMockData();
        if (mockResult.success) {
          console.log('✅ 模拟数据创建成功');
        } else {
          console.error('❌ 模拟数据创建失败:', mockResult.message);
        }
      }
    } else {
      console.error('❌ 数据库同步失败:', result.message);
      process.exit(1);
    }
  } catch (error) {
    console.error('发生错误:', error);
    process.exit(1);
  }
}

// 执行主函数
main(); 