# 旅游推荐系统 API 文档

## 基础信息

- 基础路径: `/api`
- 响应格式: JSON
- 认证方式: Bearer Token

## 错误处理

所有接口可能返回的错误状态码：

- `400` - 请求参数错误
- `401` - 未认证
- `403` - 无权限
- `404` - 资源不存在
- `500` - 服务器内部错误

## 认证相关接口

### 用户注册
- 路径: `POST /auth/register`
- 描述: 注册新用户
- 请求体:
  ```json
  {
    "username": "string",
    "password": "string",
    "email": "string"
  }
  ```
- 响应: 
  ```json
  {
    "id": "number",
    "username": "string",
    "email": "string",
    "token": "string"
  }
  ```

### 用户登录
- 路径: `POST /auth/login`
- 描述: 用户登录
- 请求体:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- 响应:
  ```json
  {
    "token": "string",
    "user": {
      "id": "number",
      "username": "string",
      "email": "string"
    }
  }
  ```

### 获取当前用户信息
- 路径: `GET /auth/me`
- 描述: 获取当前登录用户信息
- 认证: 需要
- 响应:
  ```json
  {
    "id": "number",
    "username": "string",
    "email": "string",
    "preferences": "object"
  }
  ```

### 更新用户信息
- 路径: `PUT /auth/update`
- 描述: 更新当前用户信息
- 认证: 需要
- 请求体:
  ```json
  {
    "username": "string",
    "email": "string"
  }
  ```

### 修改密码
- 路径: `PUT /auth/change-password`
- 描述: 修改当前用户密码
- 认证: 需要
- 请求体:
  ```json
  {
    "oldPassword": "string",
    "newPassword": "string"
  }
  ```

## 景点相关接口

### 获取景点列表
- 路径: `GET /attractions`
- 描述: 获取景点列表，支持分页和筛选
- 查询参数:
  - `page`: 页码（默认1）
  - `pageSize`: 每页数量（默认10）
  - `city`: 城市筛选
  - `tags`: 标签筛选（多个标签用逗号分隔）
  - `search`: 搜索关键词

### 获取附近景点
- 路径: `GET /attractions/nearby`
- 描述: 获取指定位置附近的景点
- 查询参数:
  - `latitude`: 纬度
  - `longitude`: 经度
  - `radius`: 半径（单位：千米）

### 获取景点详情
- 路径: `GET /attractions/:id`
- 描述: 获取指定景点的详细信息

### 创建景点（管理员）
- 路径: `POST /attractions`
- 描述: 创建新景点
- 认证: 需要（管理员）
- 请求体:
  ```json
  {
    "name": "string",
    "description": "string",
    "city": "string",
    "address": "string",
    "latitude": "number",
    "longitude": "number",
    "tags": "string[]",
    "images": "string[]"
  }
  ```

### 更新景点（管理员）
- 路径: `PUT /attractions/:id`
- 描述: 更新景点信息
- 认证: 需要（管理员）

### 删除景点（管理员）
- 路径: `DELETE /attractions/:id`
- 描述: 删除景点
- 认证: 需要（管理员）

## 评论相关接口

### 获取景点评论
- 路径: `GET /reviews/attraction/:attractionId`
- 描述: 获取指定景点的评论列表
- 查询参数:
  - `page`: 页码（默认1）
  - `pageSize`: 每页数量（默认10）

### 获取用户评论
- 路径: `GET /reviews/user/:userId`
- 描述: 获取指定用户的评论列表

### 获取我的评论
- 路径: `GET /reviews/me`
- 描述: 获取当前用户的评论列表
- 认证: 需要

### 创建评论
- 路径: `POST /reviews`
- 描述: 创建新评论
- 认证: 需要
- 请求体:
  ```json
  {
    "attractionId": "number",
    "rating": "number",
    "comment": "string"
  }
  ```

### 更新评论
- 路径: `PUT /reviews/:id`
- 描述: 更新评论
- 认证: 需要

### 删除评论
- 路径: `DELETE /reviews/:id`
- 描述: 删除评论
- 认证: 需要

## 收藏相关接口

### 获取用户收藏
- 路径: `GET /favorites/user/:userId`
- 描述: 获取指定用户的收藏列表

### 获取我的收藏
- 路径: `GET /favorites/me`
- 描述: 获取当前用户的收藏列表
- 认证: 需要

### 添加收藏
- 路径: `POST /favorites/attraction/:attractionId`
- 描述: 收藏景点
- 认证: 需要

### 取消收藏
- 路径: `DELETE /favorites/attraction/:attractionId`
- 描述: 取消收藏景点
- 认证: 需要

### 检查收藏状态
- 路径: `GET /favorites/check/:attractionId`
- 描述: 检查景点是否已收藏
- 认证: 需要

### 批量检查收藏状态
- 路径: `POST /favorites/check-batch`
- 描述: 批量检查多个景点的收藏状态
- 认证: 需要
- 请求体:
  ```json
  {
    "attractionIds": "number[]"
  }
  ```

## 推荐相关接口

### 获取热门推荐
- 路径: `GET /recommendations/popular`
- 描述: 获取热门景点推荐
- 查询参数:
  - `city`: 城市筛选
  - `limit`: 返回数量（默认10）

### 获取相似景点
- 路径: `GET /recommendations/similar/:attractionId`
- 描述: 获取与指定景点相似的景点推荐
- 查询参数:
  - `limit`: 返回数量（默认5）

### 获取个性化推荐
- 路径: `GET /recommendations/personalized`
- 描述: 获取基于用户偏好的个性化推荐
- 认证: 需要
- 查询参数:
  - `limit`: 返回数量（默认10）

### 获取历史推荐
- 路径: `GET /recommendations/history-based`
- 描述: 获取基于用户历史的推荐
- 认证: 需要
- 查询参数:
  - `limit`: 返回数量（默认10）

### 更新用户偏好
- 路径: `PUT /recommendations/preferences`
- 描述: 更新用户的推荐偏好设置
- 认证: 需要
- 请求体:
  ```json
  {
    "tags": "string[]",
    "cities": "string[]"
  }
  ```

## 用户相关接口

### 获取用户列表（管理员）
- 路径: `GET /users`
- 描述: 获取所有用户列表
- 认证: 需要（管理员）

### 获取用户信息
- 路径: `GET /users/:id`
- 描述: 获取指定用户的信息
- 认证: 需要

### 更新个人资料
- 路径: `PUT /users/profile`
- 描述: 更新当前用户的个人资料
- 认证: 需要

### 更新偏好设置
- 路径: `PUT /users/preferences`
- 描述: 更新当前用户的偏好设置
- 认证: 需要

### 更新密码
- 路径: `PUT /users/password`
- 描述: 更新当前用户的密码
- 认证: 需要

### 删除用户（管理员）
- 路径: `DELETE /users/:id`
- 描述: 删除指定用户
- 认证: 需要（管理员）

## 系统相关接口

### 同步数据库（管理员）
- 路径: `POST /system/sync-database`
- 描述: 同步数据库结构
- 认证: 需要（管理员） 