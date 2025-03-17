const express = require('express');
const router = express.Router();
const attractionController = require('../controllers/attractionController');
const { authenticateToken, checkRole } = require('../middleware/auth');

/**
 * 景点相关路由
 * @module routes/attractions
 */

// 公开路由
router.get('/', attractionController.getAttractions);
router.get('/nearby', attractionController.getNearbyAttractions);
router.get('/:id', attractionController.getAttractionById);

// 需要认证的路由
router.use(authenticateToken);

// 管理员路由
router.post('/', checkRole(['admin']), attractionController.createAttraction);
router.put('/:id', checkRole(['admin']), attractionController.updateAttraction);
router.delete('/:id', checkRole(['admin']), attractionController.deleteAttraction);

module.exports = router;