/**
 * 业务错误类
 * 用于处理可预期的业务错误
 */
class BusinessError extends Error {
  constructor(message, statusCode = 400, code = 'BUSINESS_ERROR') {
    super(message);
    this.name = 'BusinessError';
    this.statusCode = statusCode;
    this.code = code;
    this.isBusinessError = true;
  }
}

/**
 * 认证错误类
 */
class AuthenticationError extends BusinessError {
  constructor(message = '认证失败') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

/**
 * 授权错误类
 */
class AuthorizationError extends BusinessError {
  constructor(message = '没有权限') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

/**
 * 资源不存在错误类
 */
class NotFoundError extends BusinessError {
  constructor(resource = '资源') {
    super(`${resource}不存在`, 404, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

/**
 * 验证错误类
 */
class ValidationError extends BusinessError {
  constructor(message = '数据验证失败') {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

module.exports = {
  BusinessError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError
}; 