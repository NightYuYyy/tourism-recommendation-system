# 旅游景点推荐系统后端

## 数据库工具使用说明

本项目提供了一系列工具脚本，用于管理和检查数据库结构与API接口。

### 数据库同步工具

`syncDb.js` 是一个用于同步数据库结构的工具脚本，可以通过以下命令使用：

```bash
# 使用npm脚本
npm run db:sync           # 同步数据库结构（安全模式）
npm run db:sync:force     # 强制同步（删除并重建所有表）
npm run db:sync:alter     # 修改表结构以匹配模型（安全更新）
npm run db:info           # 仅显示数据库信息，不进行同步
npm run db:mock           # 强制同步并创建模拟数据

# 或直接使用Node
node syncDb.js            # 同步数据库结构（安全模式）
node syncDb.js --force    # 强制同步（删除并重建所有表）
node syncDb.js --alter    # 修改表结构以匹配模型（安全更新）
node syncDb.js --info     # 仅显示数据库信息，不进行同步
node syncDb.js --check    # 仅检查数据库连接
node syncDb.js --mock     # 创建模拟数据（通常与 --force 一起使用）
node syncDb.js --help     # 显示帮助信息
```

### 模型一致性检查工具

`checkModels.js` 是一个用于检查数据库表结构与模型定义一致性的工具脚本：

```bash
# 使用npm脚本
npm run db:check          # 检查模型与数据库表的一致性
npm run db:fix            # 检查并尝试修复不一致的地方

# 或直接使用Node
node checkModels.js       # 检查模型与数据库表的一致性
node checkModels.js --fix # 检查并尝试修复不一致的地方
node checkModels.js --help # 显示帮助信息
```

### API接口检查工具

`checkApis.js` 是一个用于检查API接口代码问题的工具脚本：

```bash
# 使用npm脚本
npm run api:check         # 检查API接口代码

# 或直接使用Node
node checkApis.js         # 检查API接口代码
node checkApis.js --help  # 显示帮助信息
```

## 模拟数据

系统提供了创建模拟数据的功能，包括：

- 管理员用户（用户名：admin，密码：admin123）
- 普通用户（用户名：user，密码：user123）
- 3个景点数据（故宫博物院、长城、西湖）
- 用户评分和推荐数据

使用以下命令创建模拟数据：

```bash
npm run db:mock
```

注意：此命令会先清空所有表，然后重新创建并填充模拟数据。

## 常见问题

### 数据库同步失败

如果数据库同步失败，请检查：

1. `.env` 文件中的数据库配置是否正确
2. 数据库服务器是否正常运行
3. 数据库用户是否有足够的权限

### 模型与数据库表不一致

如果模型与数据库表不一致，可以尝试：

1. 使用 `npm run db:fix` 自动修复不一致的地方
2. 如果自动修复失败，可以使用 `npm run db:sync:alter` 尝试更新表结构
3. 如果问题仍然存在，可能需要手动修改模型定义或数据库表结构

### API接口问题

如果API接口检查发现问题，请根据错误信息修复相应的代码。常见问题包括：

1. 未导入使用的模型
2. 未导入使用的中间件
3. 未导入Sequelize操作符
4. 未正确配置Redis客户端 