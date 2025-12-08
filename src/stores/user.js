import { defineStore } from 'pinia'
import { loginByPassword, loginBySmsCode, logout as logoutApi, getCurrentUserInfo, refreshToken as refreshTokenApi, getPublicKey } from '@/api/auth'
import { useMenuStore } from '@/stores/menu'
import router from '@/router'
import rsaUtil from '@/utils/rsa'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('admin_token') || '',
    userId: localStorage.getItem('admin_userId') || '',
    username: localStorage.getItem('admin_username') || '',
    nickName: localStorage.getItem('admin_nickName') || '',
    expiresIn: localStorage.getItem('admin_expiresIn') || '',
    refreshToken: localStorage.getItem('admin_refreshToken') || '',
    roles: JSON.parse(localStorage.getItem('admin_roles') || '[]'),
    permissions: JSON.parse(localStorage.getItem('admin_permissions') || '[]'),
    refreshTimer: null // Token自动刷新定时器
  }),

  getters: {
    isLoggedIn: (state) => !!state.token
  },

  actions: {
    // 初始化：恢复Token刷新定时器（应用启动时调用）
    init() {
      if (this.token && this.expiresIn) {
        this.checkAndRefreshToken()
      }
    },

    // 登录（用户名密码）
    async login(loginForm) {
      try {
        // 0. 获取RSA公钥并加密密码
        let encryptedPassword = loginForm.password
        
        // 如果公钥未设置，先获取公钥
        if (!rsaUtil.isPublicKeySet()) {
          try {
            const publicKeyRes = await getPublicKey()
            if (publicKeyRes.code === '200' && publicKeyRes.data) {
              rsaUtil.setPublicKey(publicKeyRes.data)
            }
          } catch (error) {
            console.warn('获取RSA公钥失败，使用明文密码:', error)
            // 如果获取公钥失败，使用明文密码（向后兼容）
          }
        }
        
        // 如果公钥已设置，加密密码
        if (rsaUtil.isPublicKeySet()) {
          try {
            encryptedPassword = rsaUtil.encryptData(loginForm.password)
          } catch (error) {
            console.error('密码加密失败:', error)
            throw new Error('密码加密失败，请重试')
          }
        }
        
        // 1. 调用登录接口获取 token（使用加密后的密码）
        const res = await loginByPassword({
          ...loginForm,
          password: encryptedPassword
        })
        const data = res.data
        
        // 2. 保存 token（先保存token，后续接口需要用到）
        this.token = data.accessToken
        this.expiresIn = data.expiresIn
        
        // 保存refreshToken（如果存在）
        if (data.refreshToken) {
          localStorage.setItem('admin_refreshToken', data.refreshToken)
        }
        
        localStorage.setItem('admin_token', data.accessToken)
        localStorage.setItem('admin_expiresIn', data.expiresIn)
        
        // 3. 通过 token 获取完整的用户信息（包括菜单、角色、权限）
        try {
          const userInfoRes = await getCurrentUserInfo()
          if (userInfoRes.code === '200' && userInfoRes.data) {
            const userInfo = userInfoRes.data
            
            // 保存用户基本信息
            this.userId = userInfo.userId
            this.username = userInfo.username
            this.nickName = userInfo.nickName || ''
            this.roles = userInfo.roles || []
            this.permissions = userInfo.permissions || []
            
            localStorage.setItem('admin_userId', userInfo.userId)
            localStorage.setItem('admin_username', userInfo.username)
            localStorage.setItem('admin_nickName', userInfo.nickName || '')
            localStorage.setItem('admin_roles', JSON.stringify(userInfo.roles || []))
            localStorage.setItem('admin_permissions', JSON.stringify(userInfo.permissions || []))
            
            // 保存菜单数据到 menuStore
            const menuStore = useMenuStore()
            if (userInfo.menus && userInfo.menus.length > 0) {
              menuStore.menuTree = userInfo.menus
              menuStore.menuLoaded = true
              menuStore.menuList = menuStore.flattenMenu(userInfo.menus)
              
              // 添加固定的首页菜单
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
              menuStore.menuList.unshift(homeMenu)
              
              // 提取权限标识
              menuStore.permissions = menuStore.extractPermissions(userInfo.menus)
              
              // 保存到 localStorage
            localStorage.setItem('admin_menuTree', JSON.stringify(userInfo.menus))
            localStorage.setItem('admin_permissions', JSON.stringify(menuStore.permissions))
          }
        } else {
          throw new Error(userInfoRes.message || '获取用户信息失败')
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        // 如果获取用户信息失败，尝试从 localStorage 恢复基本信息
        if (data.userId) {
          this.userId = data.userId
          this.username = data.username
          this.nickName = data.nickName || ''
          localStorage.setItem('admin_userId', data.userId)
          localStorage.setItem('admin_username', data.username)
          localStorage.setItem('admin_nickName', data.nickName || '')
        }
        
        // 尝试恢复菜单
        const menuStore = useMenuStore()
        menuStore.restoreMenus()
        
        throw error
      }
      
        // 登录成功后，设置Token自动刷新
        this.checkAndRefreshToken()
        
        return Promise.resolve(res)
      } catch (error) {
        console.error('登录失败:', error)
        // 确保错误信息能够传递到调用方
        if (error.message) {
          return Promise.reject(error)
        } else if (error.response && error.response.data) {
          const errorData = error.response.data
          return Promise.reject(new Error(errorData.message || '登录失败'))
        } else {
          return Promise.reject(new Error('登录失败，请重试'))
        }
      }
    },

    // 短信验证码登录
    async loginBySms(smsForm) {
      try {
        // 1. 调用短信登录接口获取 token
        const res = await loginBySmsCode({
          phone: smsForm.phone,
          code: smsForm.code,
          scene: 'admin',
          scope: 'admin'
        })
        
        console.log('短信登录响应:', res)
        
        // 如果返回的是错误格式，直接抛出
        if (res.code !== '200') {
          throw new Error(res.message || '登录失败')
        }
        
        const data = res.data
        
        console.log('短信登录返回的数据:', data)
        console.log('accessToken:', data.accessToken)
        
        // 2. 保存 token（先保存token，后续接口需要用到）
        if (!data.accessToken) {
          throw new Error('登录失败：未获取到Token')
        }
        
        this.token = data.accessToken
        this.expiresIn = data.expiresIn
        
        // 保存refreshToken（如果存在）
        if (data.refreshToken) {
          this.refreshToken = data.refreshToken
          localStorage.setItem('admin_refreshToken', data.refreshToken)
        }
        
        localStorage.setItem('admin_token', data.accessToken)
        localStorage.setItem('admin_expiresIn', data.expiresIn)
        
        console.log('Token已保存到localStorage:', localStorage.getItem('admin_token'))
        console.log('准备调用getCurrentUserInfo，当前token:', this.token)
        
        // 3. 通过 token 获取完整的用户信息（包括菜单、角色、权限）
        try {
          const userInfoRes = await getCurrentUserInfo()
          if (userInfoRes.code === '200' && userInfoRes.data) {
            const userInfo = userInfoRes.data
            
            // 保存用户基本信息
            this.userId = userInfo.userId
            this.username = userInfo.username
            this.nickName = userInfo.nickName || ''
            this.roles = userInfo.roles || []
            this.permissions = userInfo.permissions || []
            
            localStorage.setItem('admin_userId', userInfo.userId)
            localStorage.setItem('admin_username', userInfo.username)
            localStorage.setItem('admin_nickName', userInfo.nickName || '')
            localStorage.setItem('admin_roles', JSON.stringify(userInfo.roles || []))
            localStorage.setItem('admin_permissions', JSON.stringify(userInfo.permissions || []))
            
            // 保存菜单数据到 menuStore
            const menuStore = useMenuStore()
            if (userInfo.menus && userInfo.menus.length > 0) {
              menuStore.menuTree = userInfo.menus
              menuStore.menuLoaded = true
              menuStore.menuList = menuStore.flattenMenu(userInfo.menus)
              
              // 添加固定的首页菜单
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
              menuStore.menuList.unshift(homeMenu)
              
              // 提取权限标识
              menuStore.permissions = menuStore.extractPermissions(userInfo.menus)
              
              // 保存到 localStorage
              localStorage.setItem('admin_menuTree', JSON.stringify(userInfo.menus))
              localStorage.setItem('admin_permissions', JSON.stringify(menuStore.permissions))
            }
          } else {
            throw new Error(userInfoRes.message || '获取用户信息失败')
          }
        } catch (error) {
          console.error('获取用户信息失败:', error)
          // 如果获取用户信息失败，尝试从登录响应中恢复基本信息
          if (data.userId) {
            this.userId = data.userId
            this.username = data.username
            this.nickName = data.nickName || ''
            localStorage.setItem('admin_userId', data.userId)
            localStorage.setItem('admin_username', data.username)
            localStorage.setItem('admin_nickName', data.nickName || '')
          }
          
          // 尝试恢复菜单
          const menuStore = useMenuStore()
          menuStore.restoreMenus()
          
          throw error
        }
        
        // 登录成功后，设置Token自动刷新
        this.checkAndRefreshToken()
        
        return Promise.resolve(res)
      } catch (error) {
        console.error('短信登录失败:', error)
        // 确保错误信息能够传递到调用方
        if (error.message) {
          return Promise.reject(error)
        } else if (error.response && error.response.data) {
          const errorData = error.response.data
          return Promise.reject(new Error(errorData.message || '登录失败'))
        } else {
          return Promise.reject(new Error('登录失败，请检查验证码是否正确'))
        }
      }
    },

    // 刷新Token
    async refreshToken() {
      try {
        const res = await refreshTokenApi()
        const data = res.data
        
        // 更新Token和过期时间
        this.token = data.accessToken
        this.expiresIn = data.expiresIn || this.expiresIn
        
        localStorage.setItem('admin_token', data.accessToken)
        if (data.expiresIn) {
          localStorage.setItem('admin_expiresIn', data.expiresIn)
        }
        
        // 更新refreshToken（如果存在）
        if (data.refreshToken) {
          this.refreshToken = data.refreshToken
          localStorage.setItem('admin_refreshToken', data.refreshToken)
        }
        
        // 如果返回了用户信息，更新用户信息
        if (data.userId) {
          this.userId = data.userId
          localStorage.setItem('admin_userId', data.userId)
        }
        if (data.username) {
          this.username = data.username
          localStorage.setItem('admin_username', data.username)
        }
        if (data.nickName) {
          this.nickName = data.nickName
          localStorage.setItem('admin_nickName', data.nickName)
        }
        
        // 刷新成功后，重新设置自动刷新定时器
        this.checkAndRefreshToken()
        
        return Promise.resolve(res)
      } catch (error) {
        console.error('刷新Token失败:', error)
        return Promise.reject(error)
      }
    },

    // 检查并自动刷新Token（在Token过期前5分钟刷新）
    checkAndRefreshToken() {
      const expiresIn = parseInt(this.expiresIn || 0)
      if (expiresIn > 0 && this.token) {
        // 清除之前的定时器（如果存在）
        if (this.refreshTimer) {
          clearTimeout(this.refreshTimer)
          this.refreshTimer = null
        }
        
        // Token过期前5分钟刷新（300秒），但至少要在1分钟后刷新
        // expiresIn通常是秒数，转换为毫秒
        const expiresInMs = expiresIn * 1000
        // 计算刷新时间：过期前5分钟，但至少1分钟后，最多不超过过期时间
        const refreshTime = Math.max(60000, Math.min(expiresInMs - 300000, expiresInMs - 60000))
        
        if (refreshTime > 0) {
          this.refreshTimer = setTimeout(() => {
            this.refreshToken().catch((error) => {
              console.warn('Token自动刷新失败:', error)
              // 如果自动刷新失败，不强制退出，等待用户操作时再处理
            })
          }, refreshTime)
          
          console.log(`Token将在 ${Math.round(refreshTime / 1000)} 秒后自动刷新`)
        } else {
          console.warn('Token过期时间太短，无法设置自动刷新')
        }
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
        this.refreshToken = ''
        this.roles = []
        this.permissions = []
        
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_userId')
        localStorage.removeItem('admin_username')
        localStorage.removeItem('admin_nickName')
        localStorage.removeItem('admin_expiresIn')
        localStorage.removeItem('admin_refreshToken')
        localStorage.removeItem('admin_roles')
        localStorage.removeItem('admin_permissions')
        
        // 清除菜单数据
        const menuStore = useMenuStore()
        menuStore.clearMenus()
        
        // 清除Token自动刷新定时器
        if (this.refreshTimer) {
          clearTimeout(this.refreshTimer)
          this.refreshTimer = null
        }
        
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

