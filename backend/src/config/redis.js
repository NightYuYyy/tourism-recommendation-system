require('dotenv').config()
const Redis = require('redis')

const redisClient = Redis.createClient({
  url: process.env.REDIS_URL
})

redisClient.on('error', (err) => {
  console.error('Redis连接错误:', err)
})

redisClient.on('connect', () => {
  console.log(`Redis连接成功，使用数据库 ${process.env.REDIS_DB || 0}`)
})

// 连接Redis
const connectRedis = async () => {
  try {
    await redisClient.connect()
  } catch (error) {
    console.error('Redis连接失败:', error)
  }
}

// 设置缓存
const setCache = async (key, value, expireTime = 7200) => {
  try {
    await redisClient.set(key, JSON.stringify(value), {
      EX: expireTime
    })
    return true
  } catch (error) {
    console.error('Redis设置缓存失败:', error)
    return false
  }
}

// 获取缓存
const getCache = async (key) => {
  try {
    const data = await redisClient.get(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Redis获取缓存失败:', error)
    return null
  }
}

// 删除缓存
const deleteCache = async (key) => {
  try {
    await redisClient.del(key)
    return true
  } catch (error) {
    console.error('Redis删除缓存失败:', error)
    return false
  }
}

module.exports = {
  redisClient,
  connectRedis,
  setCache,
  getCache,
  deleteCache
}