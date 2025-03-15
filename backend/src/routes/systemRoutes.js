const express = require('express');
const router = express.Router();
const { syncDatabase } = require('../utils/syncDatabase');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// 同步数据库结构 (仅管理员可用)
router.post('/sync-database', auth, adminAuth, async (req, res) => {
  try {
    const force = req.body.force === true;
    const result = await syncDatabase(force);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '数据库同步失败',
      error: error.message 
    });
  }
});

module.exports = router; 