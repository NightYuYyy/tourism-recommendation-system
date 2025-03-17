const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');
const { authenticateToken, checkRole } = require('../middleware/auth');

/**
 * 系统相关路由
 * @module routes/system
 */

// 需要认证的路由
router.use(authenticateToken);

// 管理员路由
router.post('/sync-database', checkRole(['admin']), systemController.syncDatabase);

module.exports = router; 