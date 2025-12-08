import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useMenuStore } from '@/stores/menu'

// 基础路由（不需要权限的路由）
const constantRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/auth/third-party/callback/:type',
    name: 'ThirdPartyCallback',
    component: () => import('@/views/ThirdPartyCallback.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layout/Index.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true, title: '首页' },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '首页', requiresAuth: true }
      }
    ]
  },
  // 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/Dashboard.vue'),
    meta: { title: '页面不存在' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes
})

// 动态添加路由
// 注意：刷新页面时这个变量会重置为 false，所以需要检查路由是否真的存在
let dynamicRoutesAdded = false

/**
 * 添加动态路由
 */
export function addDynamicRoutes() {
  const menuStore = useMenuStore()
  const routes = menuStore.routes
  
  if (!routes || routes.length === 0) {
    return
  }
  
  // 检查是否所有路由都已添加
  let allRoutesAdded = true
  routes.forEach(route => {
    const childPath = route.path.startsWith('/') ? route.path.substring(1) : route.path
    const fullPath = `/${childPath}`
    const existingRoute = router.getRoutes().find(r => {
      // 检查是否是 Layout 的子路由
      return r.path === fullPath || (r.path === childPath && r.parent?.name === 'Layout')
    })
    
    if (!existingRoute) {
      allRoutesAdded = false
    }
  })
  
  // 如果所有路由都已添加，直接返回
  if (allRoutesAdded && dynamicRoutesAdded) {
    return
  }
  
  // 添加动态路由到布局路由下
  routes.forEach(route => {
    // 确保路径是相对路径（不以 / 开头）
    const childPath = route.path.startsWith('/') ? route.path.substring(1) : route.path
    const fullPath = `/${childPath}`
    
    // 检查路由是否已存在
    const existingRoute = router.getRoutes().find(r => {
      return r.path === fullPath || (r.path === childPath && r.parent?.name === 'Layout')
    })
    
    if (!existingRoute) {
      // 创建子路由配置，使用相对路径
      const childRoute = {
        ...route,
        path: childPath
      }
      
      try {
        // 使用布局路由的名称添加子路由
        router.addRoute('Layout', childRoute)
        console.log('添加动态路由:', fullPath)
      } catch (error) {
        console.error('添加路由失败:', error, childRoute)
      }
    }
  })
  
  dynamicRoutesAdded = true
}

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const menuStore = useMenuStore()
  
  // 如果访问登录页且已登录，跳转到首页
  if (to.path === '/login' && userStore.isLoggedIn) {
    next({ path: '/' })
    return
  }
  
  // 如果需要登录但未登录，跳转到登录页
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }
  
  // 如果已登录，设置Token自动刷新
  if (userStore.isLoggedIn) {
    userStore.checkAndRefreshToken()
  }
  
  // 如果已登录但菜单未加载，尝试加载菜单
  if (userStore.isLoggedIn && !menuStore.menuLoaded) {
    try {
      // 先尝试从 localStorage 恢复（快速显示）
      menuStore.restoreMenus()
      if (menuStore.menuLoaded) {
        addDynamicRoutes()
        // 如果路由已添加，继续导航
        if (to.path !== '/login') {
          next(to.fullPath)
          return
        }
      }
      
      // 然后从服务器获取最新菜单数据
      await menuStore.fetchMenus()
      // 重新添加路由（确保使用最新数据）
      dynamicRoutesAdded = false
      addDynamicRoutes()
      
      // 路由添加完成后，重新导航到目标路由
      if (to.path !== '/login') {
        next(to.fullPath)
        return
      }
    } catch (error) {
      console.error('加载菜单失败:', error)
      
      // 如果错误是401，说明token过期，尝试刷新Token
      if (error.response?.status === 401 || error.response?.data?.code === 401 || Number(error.response?.data?.code) === 401) {
        if (userStore.isLoggedIn) {
          try {
            await userStore.refreshToken()
            // 刷新成功，重试加载菜单
            await menuStore.fetchMenus()
            dynamicRoutesAdded = false
            addDynamicRoutes()
            if (to.path !== '/login') {
              next(to.fullPath)
              return
            }
          } catch (refreshError) {
            // 刷新失败，退出登录
            await userStore.logout()
            next({ path: '/login', query: { redirect: to.fullPath } })
            return
          }
        }
      }
      
      // 如果加载失败，使用已恢复的数据
      if (!menuStore.menuLoaded) {
        menuStore.restoreMenus()
      }
      addDynamicRoutes()
      
      // 如果路由已添加，继续导航
      if (to.path !== '/login' && menuStore.menuLoaded) {
        next(to.fullPath)
        return
      }
    }
  } else if (userStore.isLoggedIn && menuStore.menuLoaded) {
    // 如果菜单已加载，确保路由已添加
    addDynamicRoutes()
    
    // 检查目标路由是否存在
    const targetRoute = router.resolve(to.path)
    if (targetRoute.name === 'NotFound' && to.path !== '/dashboard' && to.path !== '/') {
      // 路由不存在，可能是动态路由还未添加，等待一下再检查
      await new Promise(resolve => setTimeout(resolve, 100))
      addDynamicRoutes()
      const retryRoute = router.resolve(to.path)
      if (retryRoute.name === 'NotFound') {
        ElMessage.error('页面不存在')
        next({ path: '/dashboard' })
        return
      }
    }
  }
  
  // 检查权限
  if (to.meta.perms && !menuStore.hasPermission(to.meta.perms)) {
    ElMessage.error('没有权限访问该页面')
    next({ path: '/' })
    return
  }
  
  next()
})

export default router

