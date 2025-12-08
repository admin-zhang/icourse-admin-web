import request from '@/utils/request'

/**
 * 获取租户列表（分页）
 * @param {Object} params - 分页参数（URL参数）
 * @param {number} params.current - 当前页码
 * @param {number} params.size - 每页数量
 * @param {Object} queryData - 查询条件（请求体）
 * @param {string} queryData.name - 租户名称（可选）
 * @param {string} queryData.tenantCode - 租户编码（可选）
 * @param {string} queryData.contactName - 联系人（可选）
 * @param {string} queryData.contactPhone - 手机号（可选）
 * @param {number} queryData.status - 状态：0-启用 1-禁用（可选）
 * @param {string} queryData.createTimeStart - 创建时间开始（可选）
 * @param {string} queryData.createTimeEnd - 创建时间结束（可选）
 * @returns {Promise} 返回分页数据 IPage<SmsTenantVO>
 */
export function getTenantList(params, queryData = {}) {
  return request({
    url: '/sms/tenant/page',
    method: 'post',
    params, // Page对象通过URL参数传递
    data: queryData // QuerySmsTenantDTO通过请求体传递
  })
}

/**
 * 根据id获取租户信息
 * @param {number} id - 租户id
 * @returns {Promise} 返回 SmsTenantVO
 */
export function getTenantById(id) {
  return request({
    url: `/sms/tenant/${id}`,
    method: 'get'
  })
}

/**
 * 新增租户
 * @param {Object} data - 租户信息
 * @param {string} data.tenantCode - 租户编码（必填）
 * @param {string} data.name - 租户名称（必填）
 * @param {string} data.contactName - 联系人姓名（可选）
 * @param {string} data.contactPhone - 联系人手机号（可选）
 * @param {string} data.contactEmail - 联系人邮箱（可选）
 * @param {string} data.address - 公司地址（可选）
 * @param {string} data.logo - 公司Logo（可选）
 * @param {string} data.licenseNo - 统一社会信用代码/营业执照号（可选）
 * @param {string} data.industry - 行业（可选）
 * @param {string} data.scale - 企业规模（可选）
 * @param {string} data.validFrom - 有效期开始（可选，格式：YYYY-MM-DD）
 * @param {string} data.validTo - 有效期结束（可选，格式：YYYY-MM-DD）
 * @param {string} data.remark - 备注（可选）
 * @param {number} data.status - 状态：0-启用 1-禁用（可选）
 * @returns {Promise} 返回 Boolean
 */
export function addTenant(data) {
  return request({
    url: '/sms/tenant/add',
    method: 'post',
    data
  })
}

/**
 * 修改租户
 * @param {Object} data - 租户信息（必须包含id）
 * @param {number} data.id - 租户ID（必填）
 * @param {string} data.tenantCode - 租户编码（必填）
 * @param {string} data.name - 租户名称（必填）
 * @param {string} data.contactName - 联系人姓名（可选）
 * @param {string} data.contactPhone - 联系人手机号（可选）
 * @param {string} data.contactEmail - 联系人邮箱（可选）
 * @param {string} data.address - 公司地址（可选）
 * @param {string} data.logo - 公司Logo（可选）
 * @param {string} data.licenseNo - 统一社会信用代码/营业执照号（可选）
 * @param {string} data.industry - 行业（可选）
 * @param {string} data.scale - 企业规模（可选）
 * @param {string} data.validFrom - 有效期开始（可选，格式：YYYY-MM-DD）
 * @param {string} data.validTo - 有效期结束（可选，格式：YYYY-MM-DD）
 * @param {string} data.remark - 备注（可选）
 * @param {number} data.status - 状态：0-启用 1-禁用（可选）
 * @returns {Promise} 返回 Boolean
 */
export function updateTenant(data) {
  return request({
    url: '/sms/tenant',
    method: 'put',
    data
  })
}

/**
 * 删除租户
 * @param {number} id - 租户id
 * @returns {Promise} 返回 Boolean
 */
export function deleteTenant(id) {
  return request({
    url: `/sms/tenant/${id}`,
    method: 'delete'
  })
}

/**
 * 启用租户
 * @param {number} id - 租户id
 * @returns {Promise} 返回 Boolean
 */
export function enableTenant(id) {
  return request({
    url: `/sms/tenant/${id}/enable`,
    method: 'patch'
  })
}

/**
 * 禁用租户
 * @param {number} id - 租户id
 * @returns {Promise} 返回 Boolean
 */
export function disableTenant(id) {
  return request({
    url: `/sms/tenant/${id}/disable`,
    method: 'patch'
  })
}

