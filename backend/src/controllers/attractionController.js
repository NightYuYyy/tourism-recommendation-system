const { Attraction, Rating, User } = require('../models/Attraction')
const { Op } = require('sequelize')

// 获取景点列表
exports.getAttractions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = '',
      category = '',
      sortBy = 'rating',
      priceMin,
      priceMax
    } = req.query

    // 构建查询条件
    const where = {}
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ]
    }
    if (category) {
      where.category = category
    }
    if (priceMin && priceMax) {
      where.price = {
        [Op.between]: [parseFloat(priceMin), parseFloat(priceMax)]
      }
    }

    // 构建排序条件
    let order = []
    switch (sortBy) {
      case 'rating':
        order = [['avgRating', 'DESC']]
        break
      case 'price':
        order = [['price', 'ASC']]
        break
      case 'created':
        order = [['createdAt', 'DESC']]
        break
      default:
        order = [['avgRating', 'DESC']]
    }

    // 分页查询
    const { rows: attractions, count } = await Attraction.findAndCountAll({
      where,
      order,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      include: [
        {
          model: Rating,
          attributes: ['rating'],
          include: [
            {
              model: User,
              attributes: ['username']
            }
          ]
        }
      ]
    })

    res.json({
      attractions,
      total: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit))
    })
  } catch (error) {
    console.error('获取景点列表错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
}

// 获取单个景点详情
exports.getAttractionById = async (req, res) => {
  try {
    const { id } = req.params
    const attraction = await Attraction.findByPk(id, {
      include: [
        {
          model: Rating,
          include: [
            {
              model: User,
              attributes: ['id', 'username']
            }
          ]
        }
      ]
    })

    if (!attraction) {
      return res.status(404).json({ message: '景点不存在' })
    }

    res.json({ attraction })
  } catch (error) {
    console.error('获取景点详情错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
}

// 添加新景点（管理员）
exports.createAttraction = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      location,
      images,
      openingHours,
      contactInfo
    } = req.body

    const attraction = await Attraction.create({
      name,
      description,
      category,
      price,
      location,
      images,
      openingHours,
      contactInfo
    })

    res.status(201).json({
      message: '景点创建成功',
      attraction
    })
  } catch (error) {
    console.error('创建景点错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
}

// 更新景点信息（管理员）
exports.updateAttraction = async (req, res) => {
  try {
    const { id } = req.params
    const attraction = await Attraction.findByPk(id)

    if (!attraction) {
      return res.status(404).json({ message: '景点不存在' })
    }

    await attraction.update(req.body)

    res.json({
      message: '景点信息更新成功',
      attraction
    })
  } catch (error) {
    console.error('更新景点信息错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
}

// 删除景点（管理员）
exports.deleteAttraction = async (req, res) => {
  try {
    const { id } = req.params
    const attraction = await Attraction.findByPk(id)

    if (!attraction) {
      return res.status(404).json({ message: '景点不存在' })
    }

    await attraction.destroy()

    res.json({ message: '景点删除成功' })
  } catch (error) {
    console.error('删除景点错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
}

// 提交景点评分
exports.rateAttraction = async (req, res) => {
  try {
    const { id } = req.params
    const { rating, comment } = req.body
    const userId = req.user.id

    const attraction = await Attraction.findByPk(id)
    if (!attraction) {
      return res.status(404).json({ message: '景点不存在' })
    }

    // 创建或更新评分
    const [userRating, created] = await Rating.findOrCreate({
      where: { userId, attractionId: id },
      defaults: { rating, comment }
    })

    if (!created) {
      await userRating.update({ rating, comment })
    }

    // 更新景点平均评分
    const ratings = await Rating.findAll({
      where: { attractionId: id }
    })
    const avgRating = ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length
    await attraction.update({ avgRating })

    res.json({
      message: created ? '评分提交成功' : '评分更新成功',
      rating: userRating
    })
  } catch (error) {
    console.error('提交评分错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
}