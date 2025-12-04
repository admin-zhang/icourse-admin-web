import request from '@/utils/request'

/**
 * 获取菜单列表（分页）
 * @param {Object} params - 分页参数（URL参数）
 * @param {number} params.current - 当前页码
 * @param {number} params.size - 每页数量
 * @param {Object} queryData - 查询条件（请求体）
 * @param {string} queryData.menuName - 菜单名称（可选）
 * @param {string} queryData.menuType - 菜单类型（M目录 C菜单 F按钮）（可选）
 * @param {number} queryData.status - 状态：0->正常；1->异常（可选）
 * @param {number} queryData.visible - 是否隐藏0-显示 1-隐藏（可选）
 * @param {string} queryData.createTimeStart - 创建时间开始（可选）
 * @param {string} queryData.createTimeEnd - 创建时间结束（可选）
 * @returns {Promise} 返回分页数据 IPage<SmsMenuVO>
 */
export function getMenuList(params, queryData = {}) {
  return request({
    url: '/sms/menu/page',
    method: 'post',
    params, // Page对象通过URL参数传递
    data: queryData // QuerySmsMenuDTO通过请求体传递
  })
}

/**
 * 获取菜单树形列表（带查询条件）
 * @param {Object} queryData - 查询条件（请求体）
 * @param {string} queryData.menuName - 菜单名称（可选）
 * @param {string} queryData.menuType - 菜单类型（M目录 C菜单 F按钮）（可选）
 * @param {number} queryData.status - 状态：0->正常；1->异常（可选）
 * @param {number} queryData.visible - 是否隐藏0-显示 1-隐藏（可选）
 * @param {string} queryData.createTimeStart - 创建时间开始（可选）
 * @param {string} queryData.createTimeEnd - 创建时间结束（可选）
 * @returns {Promise} 返回菜单树形列表 List<SmsMenuVO>
 */
export function getMenuTree(queryData = {}) {
  return request({
    url: '/sms/menu/tree',
    method: 'post',
    data: queryData
  })
}

/**
 * 获取菜单树形列表（无参数）
 * @returns {Promise} 返回菜单树形列表 List<SmsMenuVO>
 */
export function getMenuTreeSimple() {
  return request({
    url: '/sms/menu/tree',
    method: 'get'
  })
}

/**
 * 根据id获取菜单信息
 * @param {number} id - 菜单id
 * @returns {Promise} 返回 SmsMenuVO
 */
export function getMenuById(id) {
  return request({
    url: `/sms/menu/${id}`,
    method: 'get'
  })
}

/**
 * 添加菜单
 * @param {Object} data - 菜单信息
 * @param {string} data.menuName - 菜单名称（必填）
 * @param {number} data.parentId - 父菜单ID，0表示顶级菜单（必填）
 * @param {number} data.sort - 显示顺序（可选）
 * @param {string} data.icon - 图标（可选）
 * @param {string} data.path - 路由地址（可选）
 * @param {string} data.component - 组件路径（可选）
 * @param {string} data.menuType - 菜单类型（M目录 C菜单 F按钮）（必填）
 * @param {string} data.perms - 权限标识（可选）
 * @param {number} data.visible - 是否隐藏0-显示 1-隐藏（可选）
 * @param {number} data.status - 状态：0->正常；1->异常（可选）
 * @param {string} data.remark - 备注（可选）
 * @returns {Promise} 返回 Boolean
 */
export function addMenu(data) {
  return request({
    url: '/sms/menu/add',
    method: 'post',
    data
  })
}

/**
 * 更新菜单
 * @param {Object} data - 菜单信息
 * @param {number} data.id - 菜单ID（必填）
 * @param {string} data.menuName - 菜单名称（必填）
 * @param {number} data.parentId - 父菜单ID，0表示顶级菜单（必填）
 * @param {number} data.sort - 显示顺序（可选）
 * @param {string} data.icon - 图标（可选）
 * @param {string} data.path - 路由地址（可选）
 * @param {string} data.component - 组件路径（可选）
 * @param {string} data.menuType - 菜单类型（M目录 C菜单 F按钮）（必填）
 * @param {string} data.perms - 权限标识（可选）
 * @param {number} data.visible - 是否隐藏0-显示 1-隐藏（可选）
 * @param {number} data.status - 状态：0->正常；1->异常（可选）
 * @param {string} data.remark - 备注（可选）
 * @returns {Promise} 返回 Boolean
 */
export function updateMenu(data) {
  return request({
    url: '/sms/menu',
    method: 'put',
    data
  })
}

/**
 * 删除菜单
 * @param {number} id - 菜单id
 * @returns {Promise} 返回 Boolean
 */
export function deleteMenu(id) {
  return request({
    url: `/sms/menu/${id}`,
    method: 'delete'
  })
}

