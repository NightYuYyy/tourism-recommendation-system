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
    getCurrentAttraction: (state) => state.currentAttraction,
    getRecommendations: (state) => state.recommendations,
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
        const response = await axios.get('/api/attractions', { params })
        
        // 处理响应数据
        if (response.data && Array.isArray(response.data.attractions)) {
          this.attractions = response.data.attractions
          this.pagination = {
            ...this.pagination,
            total: response.data.total || response.data.attractions.length,
            page: params.page || 1,
            limit: params.limit || 10
          }
        } else {
          this.attractions = Array.isArray(response.data) ? response.data : []
          this.pagination.total = this.attractions.length
        }
      } catch (error) {
        console.error('获取景点列表失败:', error)
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
        console.error(`获取景点详情失败 (ID: ${id}):`, error)
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
        this.recommendations = response.data
        return response.data
      } catch (error) {
        console.error('获取推荐景点失败:', error)
        this.error = error.response?.data?.message || '获取推荐景点失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async rateAttraction({ attractionId, rating, comment = '' }) {
      try {
        const response = await axios.post(`/api/attractions/${attractionId}/ratings`, {
          rating,
          comment
        })
        
        // 如果当前正在查看的景点就是评价的景点，更新评分信息
        if (this.currentAttraction && this.currentAttraction.id === attractionId) {
          this.currentAttraction = {
            ...this.currentAttraction,
            ratings: [...(this.currentAttraction.ratings || []), response.data],
            avgRating: response.data.newAvgRating || this.currentAttraction.avgRating
          }
        }
        
        return response.data
      } catch (error) {
        console.error(`评价景点失败 (ID: ${attractionId}):`, error)
        throw error
      }
    },
    
    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
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
    },
    
    setAttraction(attraction) {
      this.currentAttraction = attraction
    }
  }
}) 