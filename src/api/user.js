import request from '@/utils/request'

/**
 * 获取用户列表（分页）
 * @param {Object} params - 分页参数（URL参数）
 * @param {number} params.current - 当前页码
 * @param {number} params.size - 每页数量
 * @param {Object} queryData - 查询条件（请求体）
 * @param {string} queryData.userName - 用户名（可选）
 * @param {string} queryData.phoneNumber - 手机号（可选）
 * @param {string} queryData.email - 邮箱（可选）
 * @param {number} queryData.status - 状态（可选）
 */
export function getUserList(params, queryData = {}) {
  return request({
    url: '/sms/admin/page',
    method: 'post',
    params, // Page对象通过URL参数传递
    data: queryData // QuerySmsAdminDTO通过请求体传递
  })
}

/**
 * 获取用户详情
 */
export function getUserDetail(id) {
  return request({
    url: `/user/${id}`,
    method: 'get'
  })
}

/**
 * 新增用户
 */
export function createUser(data) {
  return request({
    url: '/user',
    method: 'post',
    data
  })
}

/**
 * 更新用户
 */
export function updateUser(id, data) {
  return request({
    url: `/user/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除用户
 */
export function deleteUser(id) {
  return request({
    url: `/user/${id}`,
    method: 'delete'
  })
}

