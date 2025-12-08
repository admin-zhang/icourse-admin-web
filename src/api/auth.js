import request from '@/utils/request'

/**
 * 获取RSA公钥
 * @returns {Promise} 返回Base64编码的公钥
 */
export function getPublicKey() {
  return request({
    url: '/auth/publicKey',
    method: 'get'
  })
}

/**
 * 用户名密码登录（管理端）
 * @param {Object} data - 登录参数
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码（已加密）
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
 * 刷新Token
 * @returns {Promise} 返回新的 AuthTokenVO { accessToken, tokenType, expiresIn, userId, username, nickName }
 */
export function refreshToken() {
  return request({
    url: '/auth/refresh',
    method: 'post'
  })
}

/**
 * 验证Token是否有效
 * @returns {Promise} 返回 true/false
 */
export function validateToken() {
  return request({
    url: '/auth/validate',
    method: 'get'
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

/**
 * 获取当前登录用户的菜单树
 * @returns {Promise} 返回当前用户的菜单树 List<SmsMenuVO>
 */
export function getCurrentUserMenus() {
  return request({
    url: '/sms/user/menus',
    method: 'get'
  })
}

/**
 * 获取当前登录用户信息（包括菜单、角色、权限）
 * @returns {Promise} 返回 UserMenuVO { userId, username, nickName, roles, permissions, menus }
 */
export function getCurrentUserInfo() {
  return request({
    url: '/sms/user/info',
    method: 'get'
  })
}

/**
 * 获取第三方授权URL
 * @param {string} type - 第三方类型：WECHAT, QQ
 * @param {string} redirectUri - 回调地址（可选）
 * @returns {Promise} 返回 ThirdPartyAuthUrlVO { authUrl, state }
 */
export function getThirdPartyAuthUrl(type, redirectUri) {
  const params = redirectUri ? { redirectUri } : {}
  return request({
    url: `/auth/third-party/auth-url/${type}`,
    method: 'get',
    params
  })
}

/**
 * 第三方登录回调（获取用户信息）
 * @param {string} type - 第三方类型：WECHAT, QQ
 * @param {string} code - 授权码
 * @param {string} state - 状态参数（可选）
 * @returns {Promise} 返回 ThirdPartyUserInfoVO
 */
export function getThirdPartyUserInfo(type, code, state) {
  return request({
    url: `/auth/third-party/callback/${type}`,
    method: 'get',
    params: { code, state }
  })
}

/**
 * 绑定第三方账号
 * @param {Object} data - 绑定参数
 * @param {string} data.type - 第三方类型：WECHAT, QQ
 * @param {string} data.code - 授权码
 * @param {string} data.openId - openId（可选）
 * @param {string} data.unionId - unionId（可选，微信专用）
 * @param {string} data.state - 状态参数（可选）
 * @returns {Promise} 返回 Boolean
 */
export function bindThirdParty(data) {
  return request({
    url: '/auth/third-party/bind',
    method: 'post',
    data
  })
}

/**
 * 解绑第三方账号
 * @param {string} type - 第三方类型：WECHAT, QQ
 * @returns {Promise} 返回 Boolean
 */
export function unbindThirdParty(type) {
  return request({
    url: `/auth/third-party/unbind/${type}`,
    method: 'delete'
  })
}

/**
 * 查询第三方绑定状态
 * @returns {Promise} 返回 { wechat: boolean, qq: boolean }
 */
export function getThirdPartyBindStatus() {
  return request({
    url: '/auth/third-party/bind-status',
    method: 'get'
  })
}

