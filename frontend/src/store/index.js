import { createStore } from 'vuex'

export default createStore({
  state: {
    user: null,
    token: localStorage.getItem('token') || null,
    attractions: [],
    recommendations: [],
    loading: false,
    error: null
  },
  
  getters: {
    isAuthenticated: state => !!state.token,
    currentUser: state => state.user,
    getLoading: state => state.loading,
    getError: state => state.error
  },
  
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    SET_TOKEN(state, token) {
      state.token = token
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    },
    SET_ATTRACTIONS(state, attractions) {
      state.attractions = attractions
    },
    SET_RECOMMENDATIONS(state, recommendations) {
      state.recommendations = recommendations
    },
    SET_LOADING(state, status) {
      state.loading = status
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  
  actions: {
    async login({ commit }, credentials) {
      try {
        commit('SET_LOADING', true)
        // TODO: 实现登录API调用
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        })
        const data = await response.json()
        
        if (!response.ok) throw new Error(data.message)
        
        commit('SET_TOKEN', data.token)
        commit('SET_USER', data.user)
        return data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async logout({ commit }) {
      commit('SET_USER', null)
      commit('SET_TOKEN', null)
    },
    
    async fetchAttractions({ commit }, params = {}) {
      try {
        commit('SET_LOADING', true)
        // TODO: 实现获取景点列表API调用
        const response = await fetch('/api/attractions?' + new URLSearchParams(params))
        const data = await response.json()
        
        if (!response.ok) throw new Error(data.message)
        
        commit('SET_ATTRACTIONS', data.attractions)
        return data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchRecommendations({ commit }) {
      try {
        commit('SET_LOADING', true)
        // TODO: 实现获取推荐API调用
        const response = await fetch('/api/recommendations')
        const data = await response.json()
        
        if (!response.ok) throw new Error(data.message)
        
        commit('SET_RECOMMENDATIONS', data.recommendations)
        return data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
  }
})