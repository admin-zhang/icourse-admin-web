import request from '@/utils/request'

/**
 * 用户名密码登录（管理端）
 * @param {Object} data - 登录参数
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @param {string} data.captcha - 验证码（可选）
 * @param {string} data.captchaKey - 验证码key（可选）
 * @param {number} data.type - 登录类型 0-用户名；1-手机号；2-邮箱（可选）
 * @returns {Promise} 返回 AuthTokenVO { accessToken, tokenType, expiresIn, refreshToken, userId, username, nickName }
 */
export function loginByPassword(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

/**
 * 发送短信验证码（管理端）
 * @param {Object} data - 短信验证码请求参数
 * @param {string} data.phone - 手机号
 * @param {string} data.scene - 登录场景（admin/user/teacher），默认 admin
 * @returns {Promise}
 */
export function sendSmsCode(data) {
  return request({
    url: '/auth/sms/code',
    method: 'post',
    data: {
      ...data,
      scene: data.scene || 'admin' // 管理端默认使用 admin 场景
    }
  })
}

/**
 * 退出登录
 * @returns {Promise}
 */
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'get'
  })
}

