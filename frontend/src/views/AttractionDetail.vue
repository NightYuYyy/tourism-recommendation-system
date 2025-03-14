<template>
  <div class="attraction-detail">
    <div v-if="loading" class="loading">
      <el-skeleton :rows="10" animated />
    </div>
    
    <div v-else-if="error" class="error">
      <h2>加载失败</h2>
      <p>{{ error }}</p>
      <button class="btn btn-primary" @click="fetchAttractionDetail">重试</button>
    </div>
    
    <div v-else class="attraction-content">
      <!-- 景点头部信息 -->
      <div class="attraction-header">
        <div class="image-gallery">
          <img :src="attraction.image || 'https://via.placeholder.com/800x400?text=景点图片'" :alt="attraction.name" class="main-image">
        </div>
        
        <div class="attraction-info">
          <h1>{{ attraction.name }}</h1>
          
          <div class="meta-info">
            <div class="rating">
              <el-rate v-model="attraction.rating" disabled />
              <span>{{ attraction.rating }} ({{ attraction.reviewCount || 0 }}条评价)</span>
            </div>
            
            <div class="tags">
              <el-tag v-for="tag in attraction.tags" :key="tag" size="small">{{ tag }}</el-tag>
            </div>
            
            <div class="location">
              <i class="el-icon-location"></i>
              <span>{{ attraction.location }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 景点详细信息 -->
      <div class="detail-content">
        <div class="main-content">
          <section class="description">
            <h2>景点介绍</h2>
            <p>{{ attraction.description }}</p>
          </section>
          
          <section class="features">
            <h2>特色亮点</h2>
            <ul>
              <li v-for="(feature, index) in attraction.features" :key="index">
                {{ feature }}
              </li>
            </ul>
          </section>
          
          <section class="tips">
            <h2>游玩贴士</h2>
            <div class="tip-item" v-for="(tip, index) in attraction.tips" :key="index">
              <h3>{{ tip.title }}</h3>
              <p>{{ tip.content }}</p>
            </div>
          </section>
          
          <section class="reviews">
            <h2>游客评价</h2>
            <div class="review-item" v-for="review in attraction.reviews" :key="review.id">
              <div class="review-header">
                <span class="reviewer">{{ review.username }}</span>
                <el-rate v-model="review.rating" disabled />
                <span class="review-date">{{ review.date }}</span>
              </div>
              <p class="review-content">{{ review.content }}</p>
            </div>
            
            <div class="add-review" v-if="isLoggedIn">
              <h3>添加评价</h3>
              <div class="rating-input">
                <span>评分：</span>
                <el-rate v-model="userRating" />
              </div>
              <el-input
                type="textarea"
                v-model="userReview"
                placeholder="分享您的游玩体验..."
                :rows="4"
              />
              <button class="btn btn-primary" @click="submitReview">提交评价</button>
            </div>
            
            <div v-else class="login-prompt">
              <router-link to="/login" class="btn btn-text">登录后发表评价</router-link>
            </div>
          </section>
        </div>
        
        <div class="sidebar">
          <div class="card opening-hours">
            <h3>开放时间</h3>
            <p>{{ attraction.openingHours || '暂无信息' }}</p>
          </div>
          
          <div class="card ticket-info">
            <h3>门票信息</h3>
            <p class="price">¥{{ attraction.price || '免费' }}</p>
            <button class="btn btn-primary btn-block">预订门票</button>
          </div>
          
          <div class="card nearby">
            <h3>附近景点</h3>
            <ul class="nearby-list">
              <li v-for="item in nearbyAttractions" :key="item.id" @click="goToAttraction(item.id)">
                <img :src="item.image" :alt="item.name">
                <div>
                  <h4>{{ item.name }}</h4>
                  <p>{{ item.distance }}km</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../store/modules/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const attractionId = computed(() => route.params.id)
const isLoggedIn = computed(() => userStore.isLoggedIn)

const attraction = ref({})
const loading = ref(true)
const error = ref(null)
const nearbyAttractions = ref([])

// 用户评价
const userRating = ref(5)
const userReview = ref('')

onMounted(() => {
  fetchAttractionDetail()
})

const fetchAttractionDetail = async () => {
  loading.value = true
  error.value = null
  
  try {
    // 这里应该是从API获取数据
    // const response = await fetch(`/api/attractions/${attractionId.value}`)
    // attraction.value = await response.json()
    
    // 模拟数据
    setTimeout(() => {
      attraction.value = {
        id: attractionId.value,
        name: '示例景点详情',
        description: '这是一个示例景点的详细描述。这里有丰富的自然风光和人文历史，是旅游的绝佳去处。',
        image: 'https://via.placeholder.com/800x400?text=景点图片',
        rating: 4.5,
        reviewCount: 128,
        location: '示例省份示例城市',
        tags: ['自然风光', '历史古迹', '文化体验'],
        features: [
          '独特的自然景观',
          '丰富的历史文化',
          '特色美食体验',
          '适合摄影创作'
        ],
        tips: [
          { title: '最佳游览时间', content: '春季和秋季气候宜人，是游览的最佳季节。' },
          { title: '交通指南', content: '可乘坐公交车或出租车到达，景区内提供电瓶车服务。' }
        ],
        reviews: [
          { id: 1, username: '用户A', rating: 5, date: '2023-05-15', content: '景色非常美丽，服务也很好，值得推荐！' },
          { id: 2, username: '用户B', rating: 4, date: '2023-04-20', content: '整体不错，就是人有点多，建议避开节假日。' }
        ],
        openingHours: '09:00-17:00 (周一至周日)',
        price: 80
      }
      
      nearbyAttractions.value = [
        { id: 101, name: '附近景点1', image: 'https://via.placeholder.com/100x100', distance: 2.5 },
        { id: 102, name: '附近景点2', image: 'https://via.placeholder.com/100x100', distance: 3.8 },
        { id: 103, name: '附近景点3', image: 'https://via.placeholder.com/100x100', distance: 5.2 }
      ]
      
      loading.value = false
    }, 1000)
    
  } catch (err) {
    error.value = '加载景点信息失败，请稍后重试'
    loading.value = false
    console.error(err)
  }
}

const submitReview = async () => {
  if (!userReview.value.trim()) {
    alert('请输入评价内容')
    return
  }
  
  try {
    // 这里应该是向API提交评价
    // await fetch(`/api/attractions/${attractionId.value}/reviews`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ rating: userRating.value, content: userReview.value })
    // })
    
    // 模拟提交成功
    alert('评价提交成功！')
    userReview.value = ''
    
    // 重新获取景点信息（包含最新评价）
    fetchAttractionDetail()
  } catch (err) {
    alert('评价提交失败，请稍后重试')
    console.error(err)
  }
}

const goToAttraction = (id) => {
  router.push(`/attractions/${id}`)
}
</script>

<style lang="less" scoped>
@import '../styles/variables.less';

.attraction-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: @spacing-lg 0;
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

.attraction-header {
  margin-bottom: @spacing-xl;
  
  .main-image {
    width: 100%;
    height: 400px;
    object-fit: cover;
    border-radius: @border-radius-lg;
    margin-bottom: @spacing-md;
  }
  
  h1 {
    font-size: 32px;
    margin-bottom: @spacing-md;
  }
  
  .meta-info {
    display: flex;
    flex-wrap: wrap;
    gap: @spacing-lg;
    margin-bottom: @spacing-md;
    
    .rating {
      display: flex;
      align-items: center;
      gap: @spacing-xs;
    }
    
    .tags {
      display: flex;
      gap: @spacing-xs;
    }
    
    .location {
      display: flex;
      align-items: center;
      gap: @spacing-xs;
      color: @text-color-secondary;
    }
  }
}

.detail-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: @spacing-xl;
  
  @media (min-width: @screen-lg) {
    grid-template-columns: 2fr 1fr;
  }
  
  section {
    margin-bottom: @spacing-xl;
    
    h2 {
      font-size: 24px;
      margin-bottom: @spacing-md;
      padding-bottom: @spacing-xs;
      border-bottom: 1px solid @border-color;
    }
  }
  
  .description {
    p {
      line-height: 1.6;
    }
  }
  
  .features {
    ul {
      list-style: disc;
      padding-left: @spacing-lg;
      
      li {
        margin-bottom: @spacing-sm;
      }
    }
  }
  
  .tips {
    .tip-item {
      margin-bottom: @spacing-md;
      
      h3 {
        font-size: 18px;
        margin-bottom: @spacing-xs;
        color: @primary-color;
      }
    }
  }
  
  .reviews {
    .review-item {
      margin-bottom: @spacing-lg;
      padding-bottom: @spacing-md;
      border-bottom: 1px solid @border-color-dark;
      
      &:last-child {
        border-bottom: none;
      }
      
      .review-header {
        display: flex;
        align-items: center;
        gap: @spacing-sm;
        margin-bottom: @spacing-sm;
        
        .reviewer {
          font-weight: bold;
        }
        
        .review-date {
          color: @text-color-light;
          margin-left: auto;
        }
      }
    }
    
    .add-review {
      margin-top: @spacing-xl;
      
      h3 {
        margin-bottom: @spacing-md;
      }
      
      .rating-input {
        display: flex;
        align-items: center;
        gap: @spacing-sm;
        margin-bottom: @spacing-md;
      }
      
      .el-textarea {
        margin-bottom: @spacing-md;
      }
    }
    
    .login-prompt {
      margin-top: @spacing-lg;
      text-align: center;
    }
  }
  
  .sidebar {
    .card {
      background-color: @bg-color-light;
      border-radius: @border-radius-lg;
      padding: @spacing-lg;
      margin-bottom: @spacing-lg;
      
      h3 {
        margin-bottom: @spacing-md;
        font-size: 18px;
      }
    }
    
    .ticket-info {
      .price {
        font-size: 24px;
        font-weight: bold;
        color: @primary-color;
        margin-bottom: @spacing-md;
      }
      
      .btn-block {
        width: 100%;
      }
    }
    
    .nearby-list {
      li {
        display: flex;
        align-items: center;
        gap: @spacing-md;
        padding: @spacing-sm 0;
        cursor: pointer;
        border-bottom: 1px solid @border-color;
        
        &:last-child {
          border-bottom: none;
        }
        
        &:hover {
          h4 {
            color: @primary-color;
          }
        }
        
        img {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: @border-radius-base;
        }
        
        h4 {
          margin-bottom: @spacing-xs;
          .hover-transition();
        }
        
        p {
          color: @text-color-secondary;
          font-size: @font-size-sm;
        }
      }
    }
  }
}
</style> 