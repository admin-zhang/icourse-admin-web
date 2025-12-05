import request from '@/utils/request'

/**
 * 获取操作日志列表（分页）
 * @param {Object} params - 分页参数（URL参数）
 * @param {number} params.current - 当前页码
 * @param {number} params.size - 每页数量
 * @param {Object} queryData - 查询条件（请求体）
 * @param {string} queryData.title - 操作模块（可选）
 * @param {number} queryData.businessType - 业务类型（0其它 1新增 2修改 3删除 4查询 5导出 6导入）（可选）
 * @param {string} queryData.operName - 操作人员（可选）
 * @param {number} queryData.status - 操作状态（0正常 1异常）（可选）
 * @param {string} queryData.operTimeStart - 操作时间开始（可选）
 * @param {string} queryData.operTimeEnd - 操作时间结束（可选）
 * @returns {Promise} 返回分页数据 IPage<SmsOperLogVO>
 */
export function getOperLogList(params, queryData = {}) {
  return request({
    url: '/sms/operlog/page',
    method: 'post',
    params, // Page对象通过URL参数传递
    data: queryData // QuerySmsOperLogDTO通过请求体传递
  })
}

/**
 * 根据id获取操作日志信息
 * @param {number} id - 操作日志id
 * @returns {Promise} 返回 SmsOperLogVO
 */
export function getOperLogById(id) {
  return request({
    url: `/sms/operlog/${id}`,
    method: 'get'
  })
}

/**
 * 删除操作日志
 * @param {number} id - 操作日志id
 * @returns {Promise} 返回 Boolean
 */
export function deleteOperLog(id) {
  return request({
    url: `/sms/operlog/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除操作日志
 * @param {Array<number>} ids - 操作日志id列表
 * @returns {Promise} 返回 Boolean
 */
export function batchDeleteOperLog(ids) {
  return request({
    url: '/sms/operlog/batchDelete',
    method: 'delete',
    data: ids
  })
}

/**
 * 清空操作日志
 * @returns {Promise} 返回 Boolean
 */
export function cleanOperLog() {
  return request({
    url: '/sms/operlog/clean',
    method: 'delete'
  })
}

