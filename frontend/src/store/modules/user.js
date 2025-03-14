import { defineStore } from 'pinia'
import axios from 'axios'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user,
    isLoading: (state) => state.loading,
    getError: (state) => state.error
  },

  actions: {
    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.post('/api/auth/login', credentials)
        this.token = response.data.token
        this.user = response.data.user
        localStorage.setItem('token', response.data.token)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || '登录失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async register(userData) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.post('/api/auth/register', userData)
        this.token = response.data.token
        this.user = response.data.user
        localStorage.setItem('token', response.data.token)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || '注册失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
    },

    async updateProfile(userData) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.put(`/api/users/${this.user.id}`, userData)
        this.user = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || '更新失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchUserProfile() {
      if (!this.token) return
      
      this.loading = true
      this.error = null
      try {
        const response = await axios.get('/api/users/profile')
        this.user = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || '获取用户信息失败'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
}) 