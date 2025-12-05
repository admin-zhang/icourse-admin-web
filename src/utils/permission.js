import { useMenuStore } from '@/stores/menu'

/**
 * 权限工具类
 * 提供动态权限检查功能，避免硬编码权限标识
 */

/**
 * 根据菜单路径和操作类型动态生成权限标识
 * @param {string} menuPath - 菜单路径，如 'system/admin' 或 '/system/admin'
 * @param {string} action - 操作类型：'query'|'add'|'edit'|'remove'|'assign'|'export'|'import'
 * @returns {string} 权限标识，如 'system:admin:add'
 */
export function getPermissionKey(menuPath, action) {
  // 移除路径开头的 / 和结尾的 /index
  let path = menuPath.replace(/^\/+/, '').replace(/\/index$/, '')
  
  // 将路径转换为权限标识格式
  // system/admin -> system:admin
  const parts = path.split('/').filter(p => p)
  const module = parts.length > 0 ? parts[parts.length - 1] : ''
  const prefix = parts.length > 1 ? parts.slice(0, -1).join(':') + ':' : ''
  
  return `${prefix}${module}:${action}`
}

/**
 * 从菜单数据中查找权限标识
 * @param {string} menuPath - 菜单路径
 * @param {string} actionName - 操作名称，如 '新增'、'编辑'、'删除' 等
 * @param {boolean} searchAllMenus - 是否在所有菜单中搜索（用于跨菜单查找权限）
 * @returns {string|null} 权限标识
 */
export function findPermissionFromMenu(menuPath, actionName, searchAllMenus = false) {
  const menuStore = useMenuStore()
  const menuList = menuStore.menuList || []
  
  // 如果 searchAllMenus 为 true，在所有菜单中搜索
  if (searchAllMenus) {
    for (const menu of menuList) {
      if (menu.menuType === 'C' && menu.children) {
        const button = menu.children.find(child => {
          return child.menuType === 'F' && child.menuName?.includes(actionName)
        })
        if (button?.perms) {
          return button.perms
        }
      }
    }
    return null
  }
  
  // 找到对应的菜单项
  const menu = menuList.find(m => {
    const path = m.path?.replace(/^\/+/, '').replace(/\/index$/, '') || ''
    const menuPathClean = menuPath.replace(/^\/+/, '').replace(/\/index$/, '')
    return path === menuPathClean && m.menuType === 'C'
  })
  
  if (!menu || !menu.children) {
    return null
  }
  
  // 在子菜单（按钮）中查找匹配的操作
  const button = menu.children.find(child => {
    return child.menuType === 'F' && child.menuName?.includes(actionName)
  })
  
  return button?.perms || null
}

/**
 * 动态权限检查
 * @param {string} menuPath - 菜单路径，如 'system/admin' 或 '/system/admin'
 * @param {string} action - 操作类型：'query'|'add'|'edit'|'remove'|'assign'|'export'|'import'
 * @param {string} actionName - 操作名称（可选），用于从菜单数据中查找，如 '新增'、'编辑'、'删除'
 * @returns {boolean} 是否有权限
 */
export function hasPermission(menuPath, action, actionName = null) {
  const menuStore = useMenuStore()
  
  // 方式1：尝试从菜单数据中查找权限（优先）
  if (actionName) {
    const perm = findPermissionFromMenu(menuPath, actionName)
    if (perm) {
      return menuStore.hasPermission(perm)
    }
  }
  
  // 方式2：根据路径和操作类型动态生成权限标识
  const permissionKey = getPermissionKey(menuPath, action)
  return menuStore.hasPermission(permissionKey)
}

/**
 * 操作名称到操作类型的映射
 */
const actionNameMap = {
  '查询': 'query',
  '新增': 'add',
  '添加': 'add',
  '编辑': 'edit',
  '修改': 'edit',
  '删除': 'remove',
  '移除': 'remove',
  '分配': 'assign',
  '授权': 'assign',
  '导出': 'export',
  '导入': 'import',
  '清空': 'clean',
  '强制下线': 'remove'
}

/**
 * 根据操作名称获取操作类型
 * @param {string} actionName - 操作名称
 * @returns {string} 操作类型
 */
export function getActionType(actionName) {
  return actionNameMap[actionName] || 'query'
}

/**
 * 创建权限检查函数（用于组件中）
 * @param {string} menuPath - 菜单路径
 * @returns {Function} 权限检查函数
 */
export function createPermissionChecker(menuPath) {
  return (action, actionName = null) => {
    return hasPermission(menuPath, action, actionName)
  }
}

