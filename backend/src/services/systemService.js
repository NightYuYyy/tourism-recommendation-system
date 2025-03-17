const { syncDatabase } = require('../utils/syncDatabase');

/**
 * 系统服务类
 * 处理所有与系统相关的业务逻辑
 */
class SystemService {
  /**
   * 同步数据库结构
   * @param {boolean} force - 是否强制同步（会删除现有数据）
   * @returns {Promise<Object>} 同步结果
   */
  async syncDatabase(force = false) {
    return await syncDatabase(force);
  }
}

module.exports = new SystemService(); 