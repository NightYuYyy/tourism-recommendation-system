const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const config = require('../config/database')

// 用户注册
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body

    // 检查用户是否已存在
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: '该邮箱已被注册' })
    }

    // 密码加密
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // 创建新用户
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    })

    // 生成JWT令牌
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    )

    res.status(201).json({
      message: '注册成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    })
  } catch (error) {
    console.error('注册错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
}

// 用户登录
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    // 查找用户
    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(401).json({ message: '邮箱或密码错误' })
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ message: '邮箱或密码错误' })
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    )

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    })
  } catch (error) {
    console.error('登录错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
}

// 获取当前用户信息
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    })
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }

    res.json({ user })
  } catch (error) {
    console.error('获取用户信息错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
}

// 更新用户信息
exports.updateUser = async (req, res) => {
  try {
    const { username, email } = req.body
    const user = await User.findByPk(req.user.id)

    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }

    // 更新用户信息
    await user.update({
      username: username || user.username,
      email: email || user.email
    })

    res.json({
      message: '用户信息更新成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    })
  } catch (error) {
    console.error('更新用户信息错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
}

// 修改密码
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findByPk(req.user.id)

    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }

    // 验证当前密码
    const isValidPassword = await bcrypt.compare(currentPassword, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ message: '当前密码错误' })
    }

    // 加密新密码
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // 更新密码
    await user.update({ password: hashedPassword })

    res.json({ message: '密码修改成功' })
  } catch (error) {
    console.error('修改密码错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
}