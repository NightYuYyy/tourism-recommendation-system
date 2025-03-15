import axios from 'axios'
import { useUserStore } from '@/store/user'

const request = axios.create({
  baseURL: '/api',
  timeout: 15000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const userStore = useUserStore()
    const token = userStore.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('请求头中添加token:', `Bearer ${token.substring(0, 10)}...`)
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 打印响应状态码，帮助调试
    console.log('响应状态码:', response.status)
    
    // 304状态码表示资源未修改，使用缓存
    if (response.status === 304) {
      console.log('使用缓存数据')
      return response.data || {}
    }
    
    return response.data
  },
  error => {
    const userStore = useUserStore()
    
    if (error.response) {
      switch (error.response.status) {
        case 304:
          // 资源未修改，使用缓存
          console.log('使用缓存数据')
          return error.response.data || {}
        case 401:
          // token过期或无效，清除用户信息并跳转到登录页
          userStore.logout()
          window.location.href = '/login'
          break
        case 403:
          // 权限不足
          console.error('没有权限访问该资源')
          break
        case 404:
          // 资源不存在
          console.error('请求的资源不存在')
          break
        case 500:
          // 服务器错误
          console.error('服务器错误')
          break
        default:
          console.error(error.response.data.message || '请求失败')
      }
    } else if (error.request) {
      // 请求发出但没有收到响应
      console.error('网络错误，请检查您的网络连接')
    } else {
      // 请求配置出错
      console.error('请求配置错误:', error.message)
    }
    
    return Promise.reject(error)
  }
)

export default request 