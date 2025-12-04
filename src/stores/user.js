import { defineStore } from 'pinia'
import { loginByPassword, logout as logoutApi } from '@/api/auth'
import { useMenuStore } from '@/stores/menu'
import router from '@/router'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('admin_token') || '',
    userId: localStorage.getItem('admin_userId') || '',
    username: localStorage.getItem('admin_username') || '',
    nickName: localStorage.getItem('admin_nickName') || '',
    expiresIn: localStorage.getItem('admin_expiresIn') || ''
  }),

  getters: {
    isLoggedIn: (state) => !!state.token
  },

  actions: {
    // 登录
    async login(loginForm) {
      try {
        const res = await loginByPassword(loginForm)
        const data = res.data
        
        // 保存用户信息
        this.token = data.accessToken
        this.userId = data.userId
        this.username = data.username
        this.nickName = data.nickName
        this.expiresIn = data.expiresIn
        
        // 保存到 localStorage（使用 admin_ 前缀区分管理端）
        localStorage.setItem('admin_token', data.accessToken)
        localStorage.setItem('admin_userId', data.userId)
        localStorage.setItem('admin_username', data.username)
        localStorage.setItem('admin_nickName', data.nickName || '')
        localStorage.setItem('admin_expiresIn', data.expiresIn)
        
        // 登录成功后获取菜单数据
        const menuStore = useMenuStore()
        try {
          await menuStore.fetchMenus()
        } catch (error) {
          console.error('获取菜单失败:', error)
          // 如果获取失败，尝试从 localStorage 恢复
          menuStore.restoreMenus()
        }
        
        return Promise.resolve(res)
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 退出登录
    async logout() {
      // 先清除本地状态，避免重复调用
      if (!this.token) {
        return
      }
      
      try {
        // 尝试调用退出接口（静默失败，不阻塞退出流程）
        await logoutApi().catch(() => {
          // 忽略退出接口的错误，确保能正常清除本地状态
        })
      } catch (error) {
        console.error('退出登录失败:', error)
      } finally {
        // 清除用户信息
        this.token = ''
        this.userId = ''
        this.username = ''
        this.nickName = ''
        this.expiresIn = ''
        
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_userId')
        localStorage.removeItem('admin_username')
        localStorage.removeItem('admin_nickName')
        localStorage.removeItem('admin_expiresIn')
        
        // 清除菜单数据
        const menuStore = useMenuStore()
        menuStore.clearMenus()
        
        // 跳转到登录页（避免重复跳转）
        if (router.currentRoute.value.path !== '/login') {
          router.push('/login').catch(() => {
            // 忽略路由跳转错误（可能已经在登录页）
          })
        }
      }
    }
  }
})

