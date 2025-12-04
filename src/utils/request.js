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
    // 如果有 token，添加到请求头
    if (userStore.token) {
      config.headers.Authorization = `${userStore.token}`
    }
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data
    
    // 将 code 转换为数字进行比较（兼容字符串形式的 code）
    const code = Number(res.code)
    
    // 如果响应状态码不是 200，说明有错误
    if (code !== 200) {
      // 如果是 401 未授权，先处理退出逻辑
      if (code === 401) {
        const userStore = useUserStore()
        // 避免重复提示
        if (userStore.isLoggedIn) {
          ElMessage.error('登录已过期，请重新登录')
          userStore.logout()
        }
        return Promise.reject(new Error('登录已过期'))
      }
      
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    
    return res
  },
  (error) => {
    console.error('响应错误:', error)
    
    if (error.response) {
      const { status, data } = error.response
      
      if (status === 401) {
        const userStore = useUserStore()
        // 避免重复提示和重复跳转
        if (userStore.isLoggedIn) {
          ElMessage.error('登录已过期，请重新登录')
          userStore.logout()
        }
        return Promise.reject(error)
      } else if (status === 403) {
        ElMessage.error('没有权限访问')
      } else if (status === 500) {
        ElMessage.error('服务器错误')
      } else {
        // 检查业务错误码
        const code = Number(data?.code)
        if (code === 401) {
          const userStore = useUserStore()
          if (userStore.isLoggedIn) {
            ElMessage.error('登录已过期，请重新登录')
            userStore.logout()
          }
          return Promise.reject(error)
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

