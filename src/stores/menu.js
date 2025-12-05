import { defineStore } from 'pinia'
import { getCurrentUserMenus } from '@/api/auth'

/**
 * 菜单 Store
 * 管理菜单数据和权限信息
 */
export const useMenuStore = defineStore('menu', {
  state: () => ({
    // 菜单树形数据
    menuTree: [],
    // 扁平化的菜单列表（用于路由）
    menuList: [],
    // 权限标识列表
    permissions: [],
    // 菜单是否已加载
    menuLoaded: false
  }),

  getters: {
    /**
     * 获取所有路由配置
     */
    routes: (state) => {
      return state.menuList
        .filter(menu => {
          // 只处理菜单类型（C）且包含组件路径和路径的
          // 排除首页菜单（dashboard路由已在router/index.js中定义）
          return menu.menuType === 'C' && menu.component && menu.path && menu.status === 0 && menu.id !== 0
        })
        .map(menu => {
          // 处理路径：作为子路由时，路径不应该以 / 开头（相对路径）
          // 例如：/system/user -> system/user（作为 Layout 的子路由）
          // 这样最终访问路径会是 /system/user
          let routePath = menu.path.startsWith('/') ? menu.path.substring(1) : menu.path
          
          // 组件路径映射（用于动态导入，Vite 需要明确的导入路径）
          const componentMap = {
            'Dashboard': () => import('@/views/Dashboard.vue'),
            'system/user/index': () => import('@/views/system/user/index.vue'),
            'system/role/index': () => import('@/views/system/role/index.vue'),
            'system/menu/index': () => import('@/views/system/menu/index.vue'),
            'monitor/operlog/index': () => import('@/views/monitor/operlog/index.vue'),
            'monitor/server/index': () => import('@/views/monitor/server/index.vue'),
            'monitor/jvm/index': () => import('@/views/monitor/jvm/index.vue'),
            'monitor/redis/index': () => import('@/views/monitor/redis/index.vue'),
            'monitor/online/index': () => import('@/views/monitor/online/index.vue'),
            'monitor/info/index': () => import('@/views/monitor/info/index.vue')
          }
          
          // 获取组件导入函数
          const getComponent = () => {
            // 先尝试从映射表获取（推荐方式，Vite 可以静态分析）
            if (componentMap[menu.component]) {
              return componentMap[menu.component]().catch((error) => {
                console.warn(`组件 ${menu.component} 加载失败:`, error)
                return import('@/views/Dashboard.vue')
              })
            }
            
            // 如果映射表中没有，尝试动态导入（Vite 可能无法静态分析）
            // 注意：这种方式在构建时可能无法正确工作
            const componentPath = `@/views/${menu.component}.vue`
            console.warn(`组件 ${menu.component} 未在映射表中，尝试动态导入: ${componentPath}`)
            return import(/* @vite-ignore */ componentPath).catch((error) => {
              console.warn(`组件 ${menu.component} 不存在，使用默认组件:`, error)
              return import('@/views/Dashboard.vue')
            })
          }
          
          return {
            path: routePath,
            name: `Menu_${menu.id}`, // 使用菜单ID作为路由名称，避免重复
            component: getComponent,
            meta: {
              title: menu.menuName,
              icon: menu.icon,
              perms: menu.perms,
              menuId: menu.id,
              requiresAuth: true
            }
          }
        })
    },

    /**
     * 根据菜单类型过滤菜单（用于侧边栏显示）
     * 只显示 M（目录）和 C（菜单）类型，不显示 F（按钮）类型
     * 并在最前面添加固定的首页菜单
     */
    sidebarMenus: (state) => {
      // 固定的首页菜单
      const homeMenu = {
        id: 0,
        menuName: '首页',
        parentId: 0,
        menuType: 'C',
        path: '/dashboard',
        component: 'Dashboard',
        icon: 'house',
        status: 0,
        visible: 0,
        children: []
      }
      
      // 过滤后端返回的菜单（只显示状态正常且可见的）
      const backendMenus = (state.menuTree || []).filter(menu => {
        return (menu.menuType === 'M' || menu.menuType === 'C') && 
               menu.status === 0 && 
               menu.visible === 0
      })
      
      // 将首页菜单放在最前面
      return [homeMenu, ...backendMenus]
    }
  },

  actions: {
    /**
     * 获取当前用户的菜单数据
     */
    async fetchMenus() {
      try {
        const res = await getCurrentUserMenus()
        if (res.code === '200' && res.data) {
          this.menuTree = res.data
          this.menuLoaded = true
          
          // 扁平化菜单列表（用于路由）
          this.menuList = this.flattenMenu(res.data)
          
          // 添加固定的首页菜单到菜单列表（用于路由生成）
          const homeMenu = {
            id: 0,
            menuName: '首页',
            parentId: 0,
            menuType: 'C',
            path: '/dashboard',
            component: 'Dashboard',
            icon: 'house',
            status: 0,
            visible: 0,
            children: []
          }
          this.menuList.unshift(homeMenu) // 添加到最前面
          
          // 提取所有权限标识
          this.permissions = this.extractPermissions(res.data)
          
          // 保存到 localStorage
          localStorage.setItem('admin_menuTree', JSON.stringify(res.data))
          localStorage.setItem('admin_permissions', JSON.stringify(this.permissions))
          
          return Promise.resolve(res.data)
        } else {
          return Promise.reject(new Error(res.message || '获取菜单失败'))
        }
      } catch (error) {
        console.error('获取菜单失败:', error)
        return Promise.reject(error)
      }
    },

    /**
     * 扁平化菜单树
     * @param {Array} menus - 菜单树
     * @returns {Array} 扁平化的菜单列表
     */
    flattenMenu(menus) {
      const result = []
      
      const traverse = (items) => {
        items.forEach(menu => {
          result.push(menu)
          if (menu.children && menu.children.length > 0) {
            traverse(menu.children)
          }
        })
      }
      
      traverse(menus)
      return result
    },

    /**
     * 提取所有权限标识
     * @param {Array} menus - 菜单树
     * @returns {Array} 权限标识列表
     */
    extractPermissions(menus) {
      const permissions = []
      
      const traverse = (items) => {
        items.forEach(menu => {
          if (menu.perms) {
            permissions.push(menu.perms)
          }
          if (menu.children && menu.children.length > 0) {
            traverse(menu.children)
          }
        })
      }
      
      traverse(menus)
      return permissions
    },

    /**
     * 从 localStorage 恢复菜单数据
     */
    restoreMenus() {
      try {
        const menuTreeStr = localStorage.getItem('admin_menuTree')
        const permissionsStr = localStorage.getItem('admin_permissions')
        
        if (menuTreeStr) {
          this.menuTree = JSON.parse(menuTreeStr)
          this.menuList = this.flattenMenu(this.menuTree)
          
          // 添加固定的首页菜单到菜单列表（用于路由生成）
          const homeMenu = {
            id: 0,
            menuName: '首页',
            parentId: 0,
            menuType: 'C',
            path: '/dashboard',
            component: 'Dashboard',
            icon: 'house',
            status: 0,
            visible: 0,
            children: []
          }
          this.menuList.unshift(homeMenu) // 添加到最前面
          
          this.menuLoaded = true
        }
        
        if (permissionsStr) {
          this.permissions = JSON.parse(permissionsStr)
        }
      } catch (error) {
        console.error('恢复菜单数据失败:', error)
      }
    },

    /**
     * 检查是否有权限
     * @param {string} perm - 权限标识
     * @returns {boolean}
     */
    hasPermission(perm) {
      if (!perm) return true
      return this.permissions.includes(perm)
    },

    /**
     * 清除菜单数据
     */
    clearMenus() {
      this.menuTree = []
      this.menuList = []
      this.permissions = []
      this.menuLoaded = false
      localStorage.removeItem('admin_menuTree')
      localStorage.removeItem('admin_permissions')
    }
  }
})

