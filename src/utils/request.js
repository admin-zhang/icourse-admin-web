import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import router from '@/router'

// 创建 axios 实例
const service = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    // 优先从localStorage读取token（确保同步），如果没有则从store读取
    let token = localStorage.getItem('admin_token') || userStore.token
    // 如果有 token，添加到请求头（添加 Bearer 前缀）
    if (token) {
      // 如果token已经包含Bearer前缀，直接使用；否则添加Bearer前缀
      token = token.startsWith('Bearer ') 
        ? token 
        : `Bearer ${token}`
      config.headers.Authorization = token
    }
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 是否正在刷新Token
let isRefreshing = false
// 等待刷新Token的请求队列
let requests = []

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data
    
    // 将 code 转换为数字进行比较（兼容字符串形式的 code）
    const code = Number(res.code)
    
    // 如果响应状态码不是 200，说明有错误
    if (code !== 200) {
      // 如果是 401 未授权，尝试刷新Token（排除刷新Token接口本身和登录接口）
      if (code === 401 && response.config && 
          !response.config.url.includes('/auth/refresh') &&
          !response.config.url.includes('/auth/login')) {
        const userStore = useUserStore()
        const config = response.config
        
        // 如果正在刷新Token，将请求加入队列
        if (isRefreshing) {
          return new Promise((resolve) => {
            requests.push(() => {
              resolve(service(config))
            })
          })
        }
        
        // 尝试刷新Token
        isRefreshing = true
        return userStore.refreshToken()
          .then(() => {
            // 刷新成功，重新发送原请求
            requests.forEach(cb => cb())
            requests = []
            return service(config)
          })
          .catch(() => {
            // 刷新失败，退出登录
            requests = []
            if (userStore.isLoggedIn) {
              ElMessage.error('登录已过期，请重新登录')
              userStore.logout()
            }
            return Promise.reject(new Error('登录已过期'))
          })
          .finally(() => {
            isRefreshing = false
          })
      }
      
      // 登录接口的错误不在这里显示，由登录页面自己处理
      if (!response.config.url.includes('/auth/login')) {
        ElMessage.error(res.message || '请求失败')
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    
    return res
  },
  (error) => {
    console.error('响应错误:', error)
    
    if (error.response) {
      const { status, data, config } = error.response
      
      if (status === 401) {
        const userStore = useUserStore()
        
        // 排除刷新Token接口本身，避免无限循环
        if (config && config.url && config.url.includes('/auth/refresh')) {
          // 刷新Token接口返回401，说明Token确实无效，直接退出登录
          if (userStore.isLoggedIn) {
            ElMessage.error('登录已过期，请重新登录')
            userStore.logout()
          }
          return Promise.reject(error)
        }
        
        // 如果正在刷新Token，将请求加入队列
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            requests.push(() => {
              resolve(service(config))
            })
          })
        }
        
        // 尝试刷新Token
        isRefreshing = true
        return userStore.refreshToken()
          .then(() => {
            // 刷新成功，重新发送原请求
            requests.forEach(cb => cb())
            requests = []
            return service(config)
          })
          .catch(() => {
            // 刷新失败，退出登录
            requests = []
            if (userStore.isLoggedIn) {
              ElMessage.error('登录已过期，请重新登录')
              userStore.logout()
            }
            return Promise.reject(error)
          })
          .finally(() => {
            isRefreshing = false
          })
      } else if (status === 403) {
        ElMessage.error('没有权限访问')
      } else if (status === 500) {
        ElMessage.error('服务器错误')
      } else {
        // 检查业务错误码
        const code = Number(data?.code)
        if (code === 401) {
          const userStore = useUserStore()
          const config = error.config
          
          // 排除刷新Token接口本身，避免无限循环
          if (config && config.url && config.url.includes('/auth/refresh')) {
            // 刷新Token接口返回401，说明Token确实无效，直接退出登录
            if (userStore.isLoggedIn) {
              ElMessage.error('登录已过期，请重新登录')
              userStore.logout()
            }
            return Promise.reject(error)
          }
          
          // 如果正在刷新Token，将请求加入队列
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              requests.push(() => {
                resolve(service(config))
              })
            })
          }
          
          // 尝试刷新Token
          isRefreshing = true
          return userStore.refreshToken()
            .then(() => {
              // 刷新成功，重新发送原请求
              requests.forEach(cb => cb())
              requests = []
              return service(config)
            })
            .catch(() => {
              // 刷新失败，退出登录
              requests = []
              if (userStore.isLoggedIn) {
                ElMessage.error('登录已过期，请重新登录')
                userStore.logout()
              }
              return Promise.reject(error)
            })
            .finally(() => {
              isRefreshing = false
            })
        }
        ElMessage.error(data?.message || error.message || '请求失败')
      }
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
    
    return Promise.reject(error)
  }
)

export default service

