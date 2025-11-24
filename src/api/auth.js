import request from '@/utils/request'

/**
 * 用户名密码登录（管理端）
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
 */
export function sendSmsCode(data) {
  return request({
    url: '/auth/sms/code',
    method: 'post',
    data: {
      ...data,
      scene: 'admin' // 管理端固定使用 admin 场景
    }
  })
}

/**
 * 退出登录
 */
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'get'
  })
}

