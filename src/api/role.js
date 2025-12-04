import request from '@/utils/request'

/**
 * 获取角色列表（分页）
 * @param {Object} params - 分页参数（URL参数）
 * @param {number} params.current - 当前页码
 * @param {number} params.size - 每页数量
 * @param {Object} queryData - 查询条件（请求体）
 * @param {string} queryData.roleName - 角色名称（可选）
 * @param {string} queryData.roleKey - 角色权限字符串（可选）
 * @param {number} queryData.status - 角色状态（0正常 1停用）（可选）
 * @param {string} queryData.createTimeStart - 创建时间开始（可选）
 * @param {string} queryData.createTimeEnd - 创建时间结束（可选）
 * @returns {Promise} 返回分页数据 IPage<SmsRoleVO>
 */
export function getRoleList(params, queryData = {}) {
  return request({
    url: '/sms/role/page',
    method: 'post',
    params, // Page对象通过URL参数传递
    data: queryData // QuerySmsRoleDTO通过请求体传递
  })
}

/**
 * 获取所有角色列表
 * @returns {Promise} 返回角色列表 List<SmsRole>
 */
export function getAllRoles() {
  return request({
    url: '/sms/role/list',
    method: 'get'
  })
}

/**
 * 根据id获取角色信息
 * @param {number} id - 角色id
 * @returns {Promise} 返回 SmsRoleVO
 */
export function getRoleById(id) {
  return request({
    url: `/sms/role/${id}`,
    method: 'get'
  })
}

/**
 * 添加角色
 * @param {Object} data - 角色信息
 * @param {string} data.roleName - 角色名称（必填）
 * @param {string} data.roleKey - 角色权限字符串（必填）
 * @param {number} data.roleSort - 显示顺序（可选）
 * @param {string} data.dataScope - 数据范围（1全部数据权限 2自定义数据权限 3本部门数据权限 4本部门及以下数据权限）（可选）
 * @param {number} data.menuCheckStrictly - 菜单树选择项是否关联显示（可选）
 * @param {number} data.deptCheckStrictly - 部门树选择项是否关联显示（可选）
 * @param {number} data.status - 角色状态（0正常 1停用）（可选）
 * @param {string} data.remark - 备注（可选）
 * @param {Array<number>} data.menuIds - 菜单ID列表（可选）
 * @returns {Promise} 返回 Boolean
 */
export function addRole(data) {
  return request({
    url: '/sms/role/add',
    method: 'post',
    data
  })
}

/**
 * 更新角色
 * @param {Object} data - 角色信息
 * @param {number} data.id - 角色ID（必填）
 * @param {string} data.roleName - 角色名称（必填）
 * @param {string} data.roleKey - 角色权限字符串（必填）
 * @param {number} data.roleSort - 显示顺序（可选）
 * @param {string} data.dataScope - 数据范围（1全部数据权限 2自定义数据权限 3本部门数据权限 4本部门及以下数据权限）（可选）
 * @param {number} data.menuCheckStrictly - 菜单树选择项是否关联显示（可选）
 * @param {number} data.deptCheckStrictly - 部门树选择项是否关联显示（可选）
 * @param {number} data.status - 角色状态（0正常 1停用）（可选）
 * @param {string} data.remark - 备注（可选）
 * @param {Array<number>} data.menuIds - 菜单ID列表（可选）
 * @returns {Promise} 返回 Boolean
 */
export function updateRole(data) {
  return request({
    url: '/sms/role',
    method: 'put',
    data
  })
}

/**
 * 删除角色
 * @param {number} id - 角色id
 * @returns {Promise} 返回 Boolean
 */
export function deleteRole(id) {
  return request({
    url: `/sms/role/${id}`,
    method: 'delete'
  })
}

/**
 * 分配角色给管理员
 * @param {Object} data - 分配角色信息
 * @param {number} data.adminId - 管理员ID（必填）
 * @param {Array<number>} data.roleIds - 角色ID列表（可选）
 * @returns {Promise} 返回 Boolean
 */
export function assignRole(data) {
  return request({
    url: '/sms/role/assign',
    method: 'post',
    data
  })
}

/**
 * 根据管理员ID查询角色列表
 * @param {number} adminId - 管理员ID
 * @returns {Promise} 返回角色列表 List<SmsRole>
 */
export function getRolesByAdminId(adminId) {
  return request({
    url: `/sms/role/admin/${adminId}`,
    method: 'get'
  })
}

/**
 * 根据管理员ID查询权限标识列表
 * @param {number} adminId - 管理员ID
 * @returns {Promise} 返回权限标识列表 List<String>
 */
export function getPermissionsByAdminId(adminId) {
  return request({
    url: `/sms/role/permissions/${adminId}`,
    method: 'get'
  })
}

/**
 * 根据管理员ID查询角色标识列表（Feign调用）
 * @param {number} adminId - 管理员ID
 * @returns {Promise} 返回角色标识列表 List<String>
 */
export function getRoleKeysByAdminId(adminId) {
  return request({
    url: `/sms/role/roles/${adminId}`,
    method: 'get'
  })
}

