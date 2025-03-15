<template>
  <div class="user-profile">
    <div class="page-header">
      <h1>个人中心</h1>
    </div>
    
    <div v-if="loading" class="loading">
      <el-skeleton :rows="10" animated />
    </div>
    
    <div v-else-if="error" class="error">
      <h2>加载失败</h2>
      <p>{{ error }}</p>
      <button class="btn btn-primary" @click="fetchUserProfile">重试</button>
    </div>
    
    <div v-else class="profile-content">
      <div class="profile-sidebar">
        <div class="user-card">
          <div class="avatar">
            <img :src="user.avatar || 'https://via.placeholder.com/100x100?text=头像'" alt="用户头像">
          </div>
          <h2>{{ user.username }}</h2>
          <p class="email">{{ user.email }}</p>
          <p class="member-since">注册时间: {{ formatDate(user.createdAt) }}</p>
        </div>
        
        <div class="nav-menu">
          <div 
            v-for="(item, index) in menuItems" 
            :key="index"
            :class="['menu-item', { active: activeTab === index }]"
            @click="activeTab = index"
          >
            <span class="menu-icon">{{ item.icon }}</span>
            <span class="menu-text">{{ item.text }}</span>
          </div>
        </div>
      </div>
      
      <div class="profile-main">
        <!-- 基本信息 -->
        <div v-if="activeTab === 0" class="tab-content">
          <h2>基本信息</h2>
          
          <form @submit.prevent="updateProfile" class="profile-form">
            <div class="form-group">
              <label>用户名</label>
              <input type="text" v-model="profileForm.username" class="input-primary">
            </div>
            
            <div class="form-group">
              <label>电子邮箱</label>
              <input type="email" v-model="profileForm.email" class="input-primary">
            </div>
            
            <div class="form-group">
              <label>手机号码</label>
              <input type="tel" v-model="profileForm.phone" class="input-primary">
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">保存修改</button>
            </div>
          </form>
        </div>
        
        <!-- 旅行偏好 -->
        <div v-if="activeTab === 1" class="tab-content">
          <h2>旅行偏好</h2>
          
          <form @submit.prevent="updatePreferences" class="preferences-form">
            <div class="form-group">
              <label>偏好景点类型</label>
              <div class="checkbox-group">
                <label v-for="type in attractionTypes" :key="type.value" class="checkbox-item">
                  <input 
                    type="checkbox" 
                    :value="type.value" 
                    v-model="preferencesForm.attractionTypes"
                  >
                  <span>{{ type.label }}</span>
                </label>
              </div>
            </div>
            
            <div class="form-group">
              <label>预算范围</label>
              <el-slider 
                v-model="preferencesForm.budget" 
                range 
                :min="0" 
                :max="5000" 
                :step="100"
              />
              <div class="slider-labels">
                <span>¥{{ preferencesForm.budget[0] }}</span>
                <span>¥{{ preferencesForm.budget[1] }}</span>
              </div>
            </div>
            
            <div class="form-group">
              <label>旅行时长偏好</label>
              <div class="radio-group">
                <label v-for="duration in travelDurations" :key="duration.value" class="radio-item">
                  <input 
                    type="radio" 
                    :value="duration.value" 
                    v-model="preferencesForm.travelDuration"
                  >
                  <span>{{ duration.label }}</span>
                </label>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">保存偏好</button>
            </div>
          </form>
        </div>
        
        <!-- 我的收藏 -->
        <div v-if="activeTab === 2" class="tab-content">
          <h2>我的收藏</h2>
          
          <div v-if="favorites.length === 0" class="empty-state">
            <p>您还没有收藏任何景点</p>
            <router-link to="/attractions" class="btn btn-primary">浏览景点</router-link>
          </div>
          
          <div v-else class="favorites-grid">
            <div 
              v-for="item in favorites" 
              :key="item.id" 
              class="favorite-card"
            >
              <div class="card-image">
                <img :src="item.image" :alt="item.name">
                <button class="remove-btn" @click.stop="removeFavorite(item.id)">
                  <i class="el-icon-delete"></i>
                </button>
              </div>
              <div class="card-content">
                <h3>{{ item.name }}</h3>
                <p>{{ item.location }}</p>
                <button class="btn btn-text" @click="viewDetail(item.id)">查看详情</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 我的评价 -->
        <div v-if="activeTab === 3" class="tab-content">
          <h2>我的评价</h2>
          
          <div v-if="reviews.length === 0" class="empty-state">
            <p>您还没有发表任何评价</p>
          </div>
          
          <div v-else class="reviews-list">
            <div 
              v-for="review in reviews" 
              :key="review.id" 
              class="review-item"
            >
              <div class="review-header">
                <div class="attraction-info">
                  <h3>{{ review.attractionName }}</h3>
                  <span class="review-date">{{ formatDate(review.date) }}</span>
                </div>
                <div class="rating">
                  <el-rate v-model="review.rating" disabled />
                </div>
              </div>
              <p class="review-content">{{ review.content }}</p>
              <div class="review-actions">
                <button class="btn btn-text" @click="editReview(review)">编辑</button>
                <button class="btn btn-text text-danger" @click="deleteReview(review.id)">删除</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 安全设置 -->
        <div v-if="activeTab === 4" class="tab-content">
          <h2>安全设置</h2>
          
          <form @submit.prevent="updatePassword" class="password-form">
            <div class="form-group">
              <label>当前密码</label>
              <input type="password" v-model="passwordForm.currentPassword" class="input-primary">
            </div>
            
            <div class="form-group">
              <label>新密码</label>
              <input type="password" v-model="passwordForm.newPassword" class="input-primary">
            </div>
            
            <div class="form-group">
              <label>确认新密码</label>
              <input type="password" v-model="passwordForm.confirmPassword" class="input-primary">
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">修改密码</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import axios from 'axios'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(true)
const error = ref(null)
const user = computed(() => userStore.user || {})
const activeTab = ref(0)
const favorites = ref([])
const reviews = ref([])

const menuItems = [
  { icon: '👤', text: '基本信息' },
  { icon: '🧭', text: '旅行偏好' },
  { icon: '❤️', text: '我的收藏' },
  { icon: '💬', text: '我的评价' },
  { icon: '🔒', text: '安全设置' }
]

const attractionTypes = [
  { label: '自然风光', value: 'nature' },
  { label: '历史古迹', value: 'historical' },
  { label: '主题乐园', value: 'theme_park' },
  { label: '文化场所', value: 'cultural' },
  { label: '美食街区', value: 'food' },
  { label: '购物天堂', value: 'shopping' }
]

const travelDurations = [
  { label: '1-3天短途旅行', value: 'short' },
  { label: '4-7天中途旅行', value: 'medium' },
  { label: '8天以上长途旅行', value: 'long' }
]

// 表单数据
const profileForm = reactive({
  username: '',
  email: '',
  phone: ''
})

const preferencesForm = reactive({
  attractionTypes: [],
  budget: [500, 2000],
  travelDuration: 'medium'
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

onMounted(() => {
  fetchUserProfile()
})

const fetchUserProfile = async () => {
  loading.value = true
  error.value = null
  
  try {
    // 从store获取用户数据
    await userStore.fetchUserProfile()
    
    console.log('用户信息:', user.value)
    
    // 填充表单数据
    profileForm.username = user.value.username || ''
    profileForm.email = user.value.email || ''
    profileForm.phone = user.value.phone || ''
    
    if (user.value.preferences) {
      preferencesForm.attractionTypes = user.value.preferences.attractionTypes || []
      preferencesForm.budget = user.value.preferences.budget || [500, 2000]
      preferencesForm.travelDuration = user.value.preferences.travelDuration || 'medium'
    }
    
    // 确保用户ID存在后再获取收藏和评价数据
    if (user.value && user.value.id) {
      // 获取收藏数据
      await fetchFavorites()
      
      // 获取评价数据
      await fetchReviews()
    } else {
      console.error('用户ID不存在，无法获取收藏和评价')
    }
    
    loading.value = false
  } catch (err) {
    console.error('获取用户信息失败:', err)
    error.value = err.message || '获取用户信息失败'
    loading.value = false
  }
}

const fetchFavorites = async () => {
  try {
    // 使用axios获取收藏数据
    console.log('获取收藏')
    const response = await axios.get('/api/users/favorites', {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })
    favorites.value = response.data
  } catch (err) {
    console.error('获取收藏失败:', err)
    // 如果API不存在，使用模拟数据
    if (err.response?.status === 404) {
      favorites.value = [
        {
          id: 101,
          name: '收藏景点1',
          location: '示例省份示例城市',
          image: 'https://via.placeholder.com/300x200?text=收藏1'
        },
        {
          id: 102,
          name: '收藏景点2',
          location: '示例省份示例城市',
          image: 'https://via.placeholder.com/300x200?text=收藏2'
        }
      ]
    }
  }
}

const fetchReviews = async () => {
  try {
    // 使用axios获取评价数据
    console.log('获取评价')
    const response = await axios.get('/api/users/reviews', {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })
    reviews.value = response.data
  } catch (err) {
    console.error('获取评价失败:', err)
    // 如果API不存在，使用模拟数据
    if (err.response?.status === 404) {
      reviews.value = [
        {
          id: 201,
          attractionId: 101,
          attractionName: '评价景点1',
          rating: 4,
          content: '这是一个很棒的地方，环境优美，服务也很好。',
          date: '2023-05-20T14:30:00Z'
        },
        {
          id: 202,
          attractionId: 102,
          attractionName: '评价景点2',
          rating: 5,
          content: '非常推荐这个地方，景色优美，值得一去。',
          date: '2023-06-15T09:45:00Z'
        }
      ]
    }
  }
}

const updateProfile = async () => {
  try {
    // 使用axios向API提交数据
    const response = await axios.put('/api/users/profile', profileForm, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })
    
    // 更新store中的用户数据
    userStore.user = { ...userStore.user, ...response.data }
    
    alert('个人信息更新成功')
  } catch (err) {
    alert(err.response?.data?.message || '更新失败，请稍后重试')
    console.error('更新个人信息失败:', err)
  }
}

const updatePreferences = async () => {
  try {
    // 使用axios向API提交数据
    const response = await axios.put('/api/users/preferences', preferencesForm, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })
    
    // 更新store中的用户偏好数据
    userStore.user = { 
      ...userStore.user, 
      preferences: response.data 
    }
    
    alert('旅行偏好更新成功')
  } catch (err) {
    alert(err.response?.data?.message || '更新失败，请稍后重试')
    console.error('更新旅行偏好失败:', err)
  }
}

const updatePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    alert('两次输入的密码不一致')
    return
  }
  
  try {
    // 使用axios向API提交数据
    await axios.put('/api/users/password', {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    }, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })
    
    alert('密码修改成功')
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (err) {
    alert(err.response?.data?.message || '密码修改失败，请稍后重试')
    console.error('修改密码失败:', err)
  }
}

const removeFavorite = async (id) => {
  try {
    // 使用axios删除收藏
    await axios.delete(`/api/favorites/${id}`, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })
    
    // 更新本地数据
    favorites.value = favorites.value.filter(item => item.id !== id)
    alert('已从收藏中移除')
  } catch (err) {
    alert(err.response?.data?.message || '操作失败，请稍后重试')
    console.error('移除收藏失败:', err)
  }
}

const editReview = (review) => {
  // 这里应该打开编辑评价的对话框
  alert(`编辑评价: ${review.id}`)
}

const deleteReview = async (id) => {
  if (!confirm('确定要删除这条评价吗？')) return
  
  try {
    // 使用axios删除评价
    await axios.delete(`/api/reviews/${id}`, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })
    
    // 更新本地数据
    reviews.value = reviews.value.filter(item => item.id !== id)
    alert('评价已删除')
  } catch (err) {
    alert(err.response?.data?.message || '操作失败，请稍后重试')
    console.error('删除评价失败:', err)
  }
}

const viewDetail = (id) => {
  router.push(`/attractions/${id}`)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}
</script>

<style lang="less" scoped>
@import '../styles/variables.less';

.user-profile {
  max-width: 1200px;
  margin: 0 auto;
  padding: @spacing-lg 0;
}

.page-header {
  margin-bottom: @spacing-xl;
  
  h1 {
    font-size: 32px;
  }
}

.loading, .error {
  padding: @spacing-xl;
  text-align: center;
}

.error {
  h2 {
    color: @error-color;
    margin-bottom: @spacing-md;
  }
  
  p {
    margin-bottom: @spacing-lg;
  }
}

.profile-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: @spacing-xl;
  
  @media (min-width: @screen-md) {
    grid-template-columns: 250px 1fr;
  }
}

.profile-sidebar {
  .user-card {
    background-color: @bg-color-light;
    border-radius: @border-radius-lg;
    padding: @spacing-lg;
    text-align: center;
    margin-bottom: @spacing-lg;
    
    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      overflow: hidden;
      margin: 0 auto @spacing-md;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    h2 {
      margin-bottom: @spacing-xs;
    }
    
    .email {
      color: @text-color-secondary;
      margin-bottom: @spacing-sm;
    }
    
    .member-since {
      font-size: @font-size-sm;
      color: @text-color-light;
    }
  }
  
  .nav-menu {
    background-color: @bg-color-light;
    border-radius: @border-radius-lg;
    overflow: hidden;
    
    .menu-item {
      padding: @spacing-md;
      display: flex;
      align-items: center;
      cursor: pointer;
      .hover-transition();
      
      &:hover {
        background-color: darken(@bg-color-light, 5%);
      }
      
      &.active {
        background-color: @primary-color;
        color: @text-color-inverse;
      }
      
      .menu-icon {
        margin-right: @spacing-sm;
      }
    }
  }
}

.profile-main {
  background-color: @bg-color-light;
  border-radius: @border-radius-lg;
  padding: @spacing-lg;
  
  .tab-content {
    h2 {
      margin-bottom: @spacing-lg;
      padding-bottom: @spacing-sm;
      border-bottom: 1px solid @border-color;
    }
  }
  
  .form-group {
    margin-bottom: @spacing-lg;
    
    label {
      display: block;
      margin-bottom: @spacing-sm;
      font-weight: bold;
    }
  }
  
  .form-actions {
    margin-top: @spacing-xl;
  }
  
  .checkbox-group, .radio-group {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: @spacing-md;
    
    @media (min-width: @screen-lg) {
      grid-template-columns: repeat(3, 1fr);
    }
    
    .checkbox-item, .radio-item {
      display: flex;
      align-items: center;
      gap: @spacing-xs;
    }
  }
  
  .slider-labels {
    .flex-between();
    margin-top: @spacing-xs;
    color: @text-color-secondary;
  }
  
  .empty-state {
    text-align: center;
    padding: @spacing-xl;
    
    p {
      margin-bottom: @spacing-lg;
      color: @text-color-secondary;
    }
  }
  
  .favorites-grid {
    display: grid;
    gap: @spacing-md;
    
    @media (min-width: @screen-sm) {
      grid-template-columns: repeat(2, 1fr);
    }
    
    @media (min-width: @screen-lg) {
      grid-template-columns: repeat(3, 1fr);
    }
    
    .favorite-card {
      .card();
      
      .card-image {
        position: relative;
        aspect-ratio: 3/2;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .remove-btn {
          position: absolute;
          top: @spacing-xs;
          right: @spacing-xs;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          
          &:hover {
            background-color: @error-color;
            color: white;
          }
        }
      }
      
      .card-content {
        padding: @spacing-md;
        
        h3 {
          margin-bottom: @spacing-xs;
        }
        
        p {
          color: @text-color-secondary;
          margin-bottom: @spacing-md;
        }
      }
    }
  }
  
  .reviews-list {
    .review-item {
      padding: @spacing-md;
      border-bottom: 1px solid @border-color;
      margin-bottom: @spacing-md;
      
      &:last-child {
        border-bottom: none;
        margin-bottom: 0;
      }
      
      .review-header {
        .flex-between();
        margin-bottom: @spacing-sm;
        
        .attraction-info {
          h3 {
            margin-bottom: @spacing-xs;
          }
          
          .review-date {
            font-size: @font-size-sm;
            color: @text-color-light;
          }
        }
      }
      
      .review-content {
        margin-bottom: @spacing-md;
      }
      
      .review-actions {
        display: flex;
        gap: @spacing-md;
        
        .text-danger {
          color: @error-color;
        }
      }
    }
  }
}
</style> 