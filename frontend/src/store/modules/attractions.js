import { defineStore } from 'pinia'
import axios from 'axios'

export const useAttractionStore = defineStore('attractions', {
  state: () => ({
    attractions: [],
    recommendations: [],
    currentAttraction: null,
    loading: false,
    error: null,
    filters: {
      category: null,
      rating: null,
      price: null,
      location: null
    },
    pagination: {
      page: 1,
      limit: 10,
      total: 0
    }
  }),

  getters: {
    getAttractions: (state) => state.attractions,
    getRecommendations: (state) => state.recommendations,
    getCurrentAttraction: (state) => state.currentAttraction,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    getFilters: (state) => state.filters,
    getPagination: (state) => state.pagination
  },

  actions: {
    async fetchAttractions(params = {}) {
      this.loading = true
      this.error = null
      try {
        const queryParams = {
          ...this.filters,
          ...this.pagination,
          ...params
        }
        const response = await axios.get('/api/attractions', { params: queryParams })
        this.attractions = response.data.attractions
        this.pagination.total = response.data.total
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || '获取景点列表失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchAttractionById(id) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get(`/api/attractions/${id}`)
        this.currentAttraction = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || '获取景点详情失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchRecommendations() {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get('/api/recommendations')
        this.recommendations = response.data.recommendations
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || '获取推荐失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async rateAttraction({ attractionId, rating, comment = '' }) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.post(`/api/attractions/${attractionId}/ratings`, {
          rating,
          comment
        })
        // 更新当前景点的评分信息
        if (this.currentAttraction && this.currentAttraction.id === attractionId) {
          this.currentAttraction = {
            ...this.currentAttraction,
            avgRating: response.data.newAvgRating,
            totalRatings: response.data.totalRatings
          }
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || '评分失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
      this.pagination.page = 1 // 重置页码
    },

    setPagination(pagination) {
      this.pagination = { ...this.pagination, ...pagination }
    },

    resetFilters() {
      this.filters = {
        category: null,
        rating: null,
        price: null,
        location: null
      }
      this.pagination.page = 1
    }
  }
}) 