#!/usr/bin/env node

/**
 * API接口检查工具
 * 
 * 使用方法:
 * node checkApis.js [选项]
 * 
 * 选项:
 *   --fix     尝试修复问题
 *   --help    显示帮助信息
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 解析命令行参数
const args = process.argv.slice(2);
const options = {
  fix: args.includes('--fix'),
  help: args.includes('--help')
};

// 显示帮助信息
if (options.help) {
  console.log(`
API接口检查工具

使用方法:
  node checkApis.js [选项]

选项:
  --fix     尝试修复问题
  --help    显示帮助信息
  `);
  process.exit(0);
}

// 路由文件路径
const routesDir = path.join(__dirname, 'src', 'routes');
const modelsDir = path.join(__dirname, 'src', 'models');

// 检查模型导入
function checkModelImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const modelImports = content.match(/require\(['"]\.\.\/models\/([^'"]+)['"]\)/g) || [];
  
  const issues = [];
  
  modelImports.forEach(importStatement => {
    const modelName = importStatement.match(/require\(['"]\.\.\/models\/([^'"]+)['"]\)/)[1];
    const modelPath = path.join(modelsDir, `${modelName}.js`);
    
    if (!fs.existsSync(modelPath)) {
      issues.push({
        type: 'missing_model',
        model: modelName,
        file: filePath,
        message: `模型 ${modelName} 不存在`
      });
    }
  });
  
  return issues;
}

// 检查路由处理函数中的错误
function checkRouteHandlers(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // 检查未定义的变量
  const routeHandlers = content.match(/router\.(get|post|put|delete|patch)\([^)]+\)\s*,\s*async\s*\([^)]*\)\s*=>\s*{[^}]*}/g) || [];
  
  routeHandlers.forEach(handler => {
    // 检查是否使用了未导入的模型
    const modelsUsed = handler.match(/await\s+([A-Z][a-zA-Z0-9_]*)\./g) || [];
    
    modelsUsed.forEach(modelUse => {
      const modelName = modelUse.match(/await\s+([A-Z][a-zA-Z0-9_]*)\./)[1];
      if (!content.includes(`const ${modelName} =`) && !content.includes(`let ${modelName} =`) && !content.includes(`var ${modelName} =`)) {
        issues.push({
          type: 'undefined_model',
          model: modelName,
          file: filePath,
          message: `路由处理函数中使用了未导入的模型 ${modelName}`
        });
      }
    });
    
    // 检查是否使用了未导入的操作符
    if (handler.includes('Op.') && !content.includes('const { Op }')) {
      issues.push({
        type: 'missing_op_import',
        file: filePath,
        message: '使用了 Sequelize 操作符但未导入 { Op }'
      });
    }
  });
  
  return issues;
}

// 检查中间件使用
function checkMiddlewareUsage(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // 检查是否使用了未导入的中间件
  const middlewareUsed = content.match(/router\.[a-z]+\([^,]*,\s*([a-zA-Z0-9_]+)\s*,/g) || [];
  
  middlewareUsed.forEach(middlewareUse => {
    const middleware = middlewareUse.match(/router\.[a-z]+\([^,]*,\s*([a-zA-Z0-9_]+)\s*,/)[1];
    if (middleware !== 'async' && !content.includes(`const ${middleware} =`) && !content.includes(`let ${middleware} =`) && !content.includes(`var ${middleware} =`)) {
      issues.push({
        type: 'undefined_middleware',
        middleware,
        file: filePath,
        message: `使用了未导入的中间件 ${middleware}`
      });
    }
  });
  
  return issues;
}

// 检查Redis使用
function checkRedisUsage(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  if (content.includes('redisClient.') && !content.includes("require('../config/redis')")) {
    issues.push({
      type: 'missing_redis_import',
      file: filePath,
      message: '使用了 Redis 客户端但未正确导入'
    });
  }
  
  return issues;
}

// 主函数
async function main() {
  try {
    console.log('开始检查API接口...');
    
    const routeFiles = fs.readdirSync(routesDir)
      .filter(file => file.endsWith('Routes.js'))
      .map(file => path.join(routesDir, file));
    
    let allIssues = [];
    
    // 检查每个路由文件
    for (const filePath of routeFiles) {
      console.log(`\n检查路由文件: ${path.basename(filePath)}`);
      
      const modelIssues = checkModelImports(filePath);
      const handlerIssues = checkRouteHandlers(filePath);
      const middlewareIssues = checkMiddlewareUsage(filePath);
      const redisIssues = checkRedisUsage(filePath);
      
      const fileIssues = [
        ...modelIssues,
        ...handlerIssues,
        ...middlewareIssues,
        ...redisIssues
      ];
      
      if (fileIssues.length > 0) {
        console.log(`发现 ${fileIssues.length} 个问题:`);
        fileIssues.forEach(issue => {
          console.log(`- ${issue.message}`);
        });
        
        allIssues = [...allIssues, ...fileIssues];
      } else {
        console.log('✅ 未发现问题');
      }
    }
    
    // 汇总结果
    if (allIssues.length > 0) {
      console.log(`\n总结: 发现 ${allIssues.length} 个问题`);
      
      if (options.fix) {
        console.log('\n尝试修复问题...');
        // 这里可以添加自动修复逻辑
        console.log('自动修复功能尚未实现，请手动修复问题');
      }
    } else {
      console.log('\n✅ 所有API接口检查通过');
    }
    
  } catch (error) {
    console.error('发生错误:', error);
    process.exit(1);
  }
}

// 执行主函数
main(); 