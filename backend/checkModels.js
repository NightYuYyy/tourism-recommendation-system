#!/usr/bin/env node

/**
 * 数据库模型一致性检查工具
 * 
 * 使用方法:
 * node checkModels.js [选项]
 * 
 * 选项:
 *   --fix     自动修复不一致的地方（使用alter）
 *   --help    显示帮助信息
 */

require('dotenv').config();
const sequelize = require('./src/config/database');
const { DataTypes } = require('sequelize');
const User = require('./src/models/User');
const Attraction = require('./src/models/Attraction');
const Rating = require('./src/models/Rating');
const Recommendation = require('./src/models/Recommendation');
const { defineAssociations } = require('./src/utils/syncDatabase');

// 解析命令行参数
const args = process.argv.slice(2);
const options = {
  fix: args.includes('--fix'),
  help: args.includes('--help')
};

// 显示帮助信息
if (options.help) {
  console.log(`
数据库模型一致性检查工具

使用方法:
  node checkModels.js [选项]

选项:
  --fix     自动修复不一致的地方（使用alter）
  --help    显示帮助信息
  `);
  process.exit(0);
}

// 获取模型定义的字段
function getModelAttributes(model) {
  return model.rawAttributes;
}

// 获取数据库表的字段
async function getTableColumns(tableName) {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        column_name, 
        column_type, 
        is_nullable, 
        column_key, 
        column_default, 
        extra
      FROM 
        information_schema.columns 
      WHERE 
        table_schema = '${process.env.DB_NAME}' 
        AND table_name = '${tableName}'
      ORDER BY 
        ordinal_position
    `);
    return results;
  } catch (error) {
    console.error(`获取表 ${tableName} 结构失败:`, error);
    return [];
  }
}

// 比较模型和表结构
async function compareModelWithTable(model, tableName) {
  console.log(`\n检查模型 ${model.name} 与表 ${tableName} 的一致性...`);
  
  // 获取模型属性
  const modelAttributes = getModelAttributes(model);
  
  // 获取表字段
  const tableColumns = await getTableColumns(tableName);
  
  if (tableColumns.length === 0) {
    console.error(`表 ${tableName} 不存在或无法访问`);
    return { model: model.name, table: tableName, exists: false, differences: [] };
  }
  
  // 检查差异
  const differences = [];
  
  // 检查模型中定义的字段是否存在于表中
  for (const [attrName, attrDef] of Object.entries(modelAttributes)) {
    // 跳过 Sequelize 内部字段
    if (attrName === 'createdAt' || attrName === 'updatedAt') continue;
    
    const columnName = attrDef.field || attrName;
    const column = tableColumns.find(col => col.COLUMN_NAME.toLowerCase() === columnName.toLowerCase());
    
    if (!column) {
      differences.push({
        type: 'missing_column',
        model: model.name,
        field: attrName,
        message: `表中缺少字段 ${columnName}`
      });
      continue;
    }
    
    // 检查类型是否匹配
    // 这里只做简单检查，实际上需要更复杂的类型映射
    const sequelizeType = attrDef.type.key || attrDef.type.constructor.key;
    let dbType = column.COLUMN_TYPE.toUpperCase();
    
    // 简化类型比较
    let typeMatches = false;
    
    if (sequelizeType === 'INTEGER' && dbType.includes('INT')) {
      typeMatches = true;
    } else if (sequelizeType === 'STRING' && (dbType.includes('VARCHAR') || dbType.includes('CHAR'))) {
      typeMatches = true;
    } else if (sequelizeType === 'TEXT' && dbType.includes('TEXT')) {
      typeMatches = true;
    } else if (sequelizeType === 'DECIMAL' && dbType.includes('DECIMAL')) {
      typeMatches = true;
    } else if (sequelizeType === 'BOOLEAN' && (dbType.includes('TINYINT(1)') || dbType.includes('BIT'))) {
      typeMatches = true;
    } else if (sequelizeType === 'DATE' && (dbType.includes('DATE') || dbType.includes('DATETIME'))) {
      typeMatches = true;
    } else if (sequelizeType === 'JSON' && dbType.includes('JSON')) {
      typeMatches = true;
    } else if (sequelizeType === 'ENUM' && dbType.includes('ENUM')) {
      typeMatches = true;
    }
    
    if (!typeMatches) {
      differences.push({
        type: 'type_mismatch',
        model: model.name,
        field: attrName,
        modelType: sequelizeType,
        dbType: column.COLUMN_TYPE,
        message: `字段 ${columnName} 类型不匹配: 模型中为 ${sequelizeType}, 数据库中为 ${column.COLUMN_TYPE}`
      });
    }
    
    // 检查是否允许为空
    const modelAllowNull = attrDef.allowNull !== false;
    const dbAllowNull = column.IS_NULLABLE === 'YES';
    
    if (modelAllowNull !== dbAllowNull) {
      differences.push({
        type: 'nullable_mismatch',
        model: model.name,
        field: attrName,
        message: `字段 ${columnName} 可空性不匹配: 模型中为 ${modelAllowNull}, 数据库中为 ${dbAllowNull}`
      });
    }
  }
  
  // 检查表中的字段是否存在于模型中
  for (const column of tableColumns) {
    // 跳过 Sequelize 内部字段
    if (['created_at', 'updated_at', 'createdAt', 'updatedAt'].includes(column.COLUMN_NAME)) continue;
    
    const modelAttr = Object.entries(modelAttributes).find(
      ([_, attr]) => (attr.field || _).toLowerCase() === column.COLUMN_NAME.toLowerCase()
    );
    
    if (!modelAttr) {
      differences.push({
        type: 'extra_column',
        model: model.name,
        column: column.COLUMN_NAME,
        message: `模型中缺少字段 ${column.COLUMN_NAME}`
      });
    }
  }
  
  return { 
    model: model.name, 
    table: tableName, 
    exists: true, 
    differences,
    isConsistent: differences.length === 0
  };
}

// 主函数
async function main() {
  try {
    // 检查数据库连接
    try {
      await sequelize.authenticate();
      console.log('数据库连接成功');
    } catch (error) {
      console.error('数据库连接失败:', error);
      process.exit(1);
    }
    
    // 定义关联关系
    defineAssociations();
    
    // 检查每个模型
    const models = [
      { model: User, tableName: 'users' },
      { model: Attraction, tableName: 'attractions' },
      { model: Rating, tableName: 'ratings' },
      { model: Recommendation, tableName: 'recommendations' }
    ];
    
    const results = [];
    
    for (const { model, tableName } of models) {
      const result = await compareModelWithTable(model, tableName);
      results.push(result);
      
      if (result.differences.length > 0) {
        console.log(`\n发现 ${result.differences.length} 个不一致:`);
        result.differences.forEach(diff => {
          console.log(`- ${diff.message}`);
        });
      } else {
        console.log(`✅ 模型 ${model.name} 与表 ${tableName} 一致`);
      }
    }
    
    // 汇总结果
    const inconsistentModels = results.filter(r => !r.isConsistent);
    
    if (inconsistentModels.length > 0) {
      console.log(`\n总结: 发现 ${inconsistentModels.length} 个模型与数据库表不一致`);
      
      if (options.fix) {
        console.log('\n尝试修复不一致...');
        await sequelize.sync({ alter: true });
        console.log('修复完成，请重新运行检查以验证');
      } else {
        console.log('\n可以使用 --fix 选项尝试自动修复不一致');
      }
    } else {
      console.log('\n✅ 所有模型与数据库表结构一致');
    }
    
  } catch (error) {
    console.error('发生错误:', error);
    process.exit(1);
  } finally {
    // 关闭数据库连接
    await sequelize.close();
  }
}

// 执行主函数
main(); 