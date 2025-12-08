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
 * 短信验证码登录（OAuth2）
 * @param {Object} data - 登录参数
 * @param {string} data.phone - 手机号
 * @param {string} data.code - 验证码
 * @param {string} data.scene - 登录场景（admin/user/teacher），默认 admin
 * @param {string} data.scope - 作用域，默认 admin
 * @returns {Promise} 返回 AuthTokenVO { accessToken, tokenType, expiresIn, refreshToken, userId, username, nickName }
 */
export function loginBySmsCode(data) {
  // OAuth2接口需要使用form-data格式，并且需要Basic认证
  const clientId = 'sms-admin-client'
  const clientSecret = 'sms-admin-secret'
  const credentials = btoa(`${clientId}:${clientSecret}`)
  
  // 构建form-data参数
  const params = new URLSearchParams()
  params.append('grant_type', 'sms_code')
  params.append('phone', data.phone)
  params.append('code', data.code)
  params.append('scene', data.scene || 'admin')
  params.append('scope', data.scope || 'admin')
  
  // 使用axios直接调用，不使用request工具（因为需要Basic认证和form-data）
  // 注意：后端CustomOAuth2TokenResponseHandler已经将OAuth2响应转换为统一格式
  return import('axios').then(axios => {
    return axios.default.post('/api/oauth2/token', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      }
    }).then(response => {
      // 后端CustomOAuth2TokenResponseHandler已经转换为统一格式 {code, message, data}
      // data包含：{accessToken, refreshToken, tokenType, expiresIn, userId, username, nickName}
      const res = response.data
      
      console.log('OAuth2登录响应:', res)
      
      // 如果后端返回的是统一格式，直接返回
      if (res.code && res.data) {
        return res
      }
      
      // 兼容处理：如果后端返回的是OAuth2标准格式（不应该发生，但做兼容）
      return {
        code: '200',
        message: '登录成功',
        data: {
          accessToken: res.access_token || res.accessToken,
          tokenType: res.token_type || res.tokenType || 'Bearer',
          expiresIn: res.expires_in || res.expiresIn,
          refreshToken: res.refresh_token || res.refreshToken,
          userId: res.user_id || res.userId,
          username: res.username,
          nickName: res.nick_name || res.nickName || res.display_name || res.displayName
        }
      }
    }).catch(error => {
      // 处理OAuth2错误响应
      console.error('OAuth2登录错误:', error)
      if (error.response && error.response.data) {
        const errorData = error.response.data
        // 后端可能返回统一格式的错误，也可能返回OAuth2标准错误
        const errorMessage = errorData.message || errorData.error_description || errorData.error || '登录失败'
        return Promise.reject(new Error(errorMessage))
      } else {
        return Promise.reject(new Error(error.message || '登录失败，请检查网络连接'))
      }
    })
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

