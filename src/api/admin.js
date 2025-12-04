import request from '@/utils/request'

/**
 * 获取管理员列表（分页）
 * @param {Object} params - 分页参数（URL参数）
 * @param {number} params.current - 当前页码
 * @param {number} params.size - 每页数量
 * @param {Object} queryData - 查询条件（请求体）
 * @param {string} queryData.userName - 用户账号（可选）
 * @param {string} queryData.nickName - 用户昵称（可选）
 * @param {string} queryData.phoneNumber - 手机号码（可选）
 * @param {string} queryData.sex - 用户性别：0->男;1->女;2->保密（可选）
 * @param {string} queryData.status - 状态：0->正常；1->异常（可选）
 * @param {string} queryData.createTimeStart - 创建时间开始（可选）
 * @param {string} queryData.createTimeEnd - 创建时间结束（可选）
 * @returns {Promise} 返回分页数据 IPage<SmsAdminVO>
 */
export function getAdminList(params, queryData = {}) {
  return request({
    url: '/sms/admin/page',
    method: 'post',
    params, // Page对象通过URL参数传递
    data: queryData // QuerySmsAdminDTO通过请求体传递
  })
}

/**
 * 根据id获取管理员信息
 * @param {number} id - 管理员id
 * @returns {Promise} 返回 SmsAdminVO
 */
export function getAdminById(id) {
  return request({
    url: `/admin/${id}`,
    method: 'get'
  })
}

/**
 * 删除管理员
 * @param {number} id - 管理员id
 * @returns {Promise} 返回 Boolean
 */
export function deleteAdmin(id) {
  return request({
    url: `/sms/admin/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除管理员
 * @param {Array<number>} ids - 管理员id列表
 * @returns {Promise} 返回 Boolean
 */
export function batchDeleteAdmin(ids) {
  return request({
    url: '/sms/admin/batchDelete',
    method: 'delete',
    data: ids
  })
}

/**
 * 添加管理员
 * @param {Object} data - 管理员信息
 * @param {string} data.userName - 用户账号（必填）
 * @param {string} data.passWord - 用户密码（可选）
 * @param {string} data.nickName - 用户昵称（可选）
 * @param {string} data.email - 用户邮箱（可选）
 * @param {string} data.icon - 头像（可选）
 * @param {string} data.phoneNumber - 手机号码（必填）
 * @param {string} data.sex - 用户性别：0->男;1->女;2->保密（可选）
 * @param {number} data.status - 状态：0->正常；1->异常（可选）
 * @returns {Promise} 返回 Boolean
 */
export function addAdmin(data) {
  return request({
    url: '/sms/admin/add',
    method: 'post',
    data
  })
}

/**
 * 更新管理员
 * @param {Object} data - 管理员信息
 * @param {number} data.id - 用户编号（必填）
 * @param {string} data.userName - 用户账号（必填）
 * @param {string} data.passWord - 用户密码（可选）
 * @param {string} data.nickName - 用户昵称（可选）
 * @param {string} data.email - 用户邮箱（可选）
 * @param {string} data.icon - 头像（可选）
 * @param {string} data.phoneNumber - 手机号码（必填）
 * @param {string} data.sex - 用户性别：0->男;1->女;2->保密（可选）
 * @param {number} data.status - 状态：0->正常；1->异常（可选）
 * @returns {Promise} 返回 Boolean
 */
export function updateAdmin(data) {
  return request({
    url: '/sms/admin',
    method: 'put',
    data
  })
}

/**
 * 修改密码
 * @param {Object} data - 密码修改信息
 * @param {number} data.id - 用户编号（必填）
 * @param {string} data.oldPassWord - 原密码（必填）
 * @param {string} data.newPassWord - 新密码（必填）
 * @returns {Promise} 返回 Boolean
 */
export function changePassword(data) {
  return request({
    url: '/sms/admin/changePassword',
    method: 'put',
    data
  })
}

/**
 * 导出管理员
 * @returns {Promise} 返回管理员列表（用于导出Excel）
 */
export function exportAdmin() {
  return request({
    url: '/sms/admin/export',
    method: 'get',
    responseType: 'blob' // 导出文件需要使用 blob 类型
  })
}

