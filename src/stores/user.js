import { defineStore } from 'pinia'
import { loginByPassword, logout as logoutApi } from '@/api/auth'
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
        
        return Promise.resolve(res)
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 退出登录
    async logout() {
      try {
        if (this.token) {
          await logoutApi()
        }
      } catch (error) {
        console.error('退出登录失败:', error)
      } finally {
        // 清除本地存储
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
        
        // 跳转到登录页
        router.push('/login')
      }
    }
  }
})

