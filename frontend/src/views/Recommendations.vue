<template>
  <div class="recommendations">
    <div class="page-header">
      <h1>为您推荐</h1>
      <p>基于您的偏好和历史浏览，为您精选的旅游景点</p>
    </div>
    
    <div v-if="loading" class="loading">
      <el-skeleton :rows="10" animated />
    </div>
    
    <div v-else-if="error" class="error">
      <h2>加载失败</h2>
      <p>{{ error }}</p>
      <button class="btn btn-primary" @click="fetchRecommendations">重试</button>
    </div>
    
    <div v-else>
      <!-- 推荐类别 -->
      <div class="recommendation-categories">
        <div 
          v-for="(category, index) in categories" 
          :key="index"
          :class="['category-tab', { active: activeCategory === index }]"
          @click="activeCategory = index"
        >
          {{ category.name }}
        </div>
      </div>
      
      <!-- 推荐列表 -->
      <div class="recommendations-grid">
        <div 
          v-for="attraction in filteredRecommendations" 
          :key="attraction.id" 
          class="attraction-card"
          @click="viewDetail(attraction.id)"
        >
          <div class="card-image">
            <img :src="attraction.image" :alt="attraction.name" />
            <div class="card-tags">
              <span v-for="tag in attraction.tags.slice(0, 2)" :key="tag" class="tag">
                {{ tag }}
              </span>
            </div>
          </div>
          <div class="card-content">
            <h3>{{ attraction.name }}</h3>
            <p class="description">{{ attraction.description }}</p>
            <div class="card-footer">
              <div class="rating">
                <el-rate v-model="attraction.rating" disabled />
                <span>{{ attraction.rating }}</span>
              </div>
              <span class="match">{{ attraction.matchScore }}% 匹配</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 无推荐提示 -->
      <div v-if="filteredRecommendations.length === 0" class="no-recommendations">
        <p>暂无推荐内容，请完善您的偏好设置或浏览更多景点</p>
        <router-link to="/profile" class="btn btn-primary">完善偏好</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(true)
const error = ref(null)
const recommendations = ref([])
const activeCategory = ref(0)

const categories = ref([
  { name: '全部推荐', filter: () => true },
  { name: '自然风光', filter: item => item.tags.includes('自然风光') },
  { name: '历史古迹', filter: item => item.tags.includes('历史古迹') },
  { name: '文化体验', filter: item => item.tags.includes('文化体验') },
  { name: '美食之旅', filter: item => item.tags.includes('美食') }
])

const filteredRecommendations = computed(() => {
  return recommendations.value.filter(categories.value[activeCategory.value].filter)
})

onMounted(() => {
  fetchRecommendations()
})

const fetchRecommendations = async () => {
  loading.value = true
  error.value = null
  
  try {
    // 这里应该是从API获取数据
    // const response = await fetch('/api/recommendations')
    // recommendations.value = await response.json()
    
    // 模拟数据
    setTimeout(() => {
      recommendations.value = [
        {
          id: 1,
          name: '示例景点1',
          description: '这是一个根据您的偏好推荐的自然风光景点。',
          image: 'https://via.placeholder.com/400x300?text=自然风光',
          tags: ['自然风光', '摄影胜地'],
          rating: 4.8,
          matchScore: 95
        },
        {
          id: 2,
          name: '示例景点2',
          description: '这是一个历史悠久的古迹，您可能会感兴趣。',
          image: 'https://via.placeholder.com/400x300?text=历史古迹',
          tags: ['历史古迹', '文化体验'],
          rating: 4.5,
          matchScore: 87
        },
        {
          id: 3,
          name: '示例景点3',
          description: '这里有丰富的文化体验活动，适合全家出游。',
          image: 'https://via.placeholder.com/400x300?text=文化体验',
          tags: ['文化体验', '亲子活动'],
          rating: 4.3,
          matchScore: 82
        },
        {
          id: 4,
          name: '示例景点4',
          description: '这里有当地特色美食，是品尝美食的好去处。',
          image: 'https://via.placeholder.com/400x300?text=美食之旅',
          tags: ['美食', '休闲'],
          rating: 4.6,
          matchScore: 90
        },
        {
          id: 5,
          name: '示例景点5',
          description: '这是一个适合放松身心的自然景点。',
          image: 'https://via.placeholder.com/400x300?text=自然风光',
          tags: ['自然风光', '休闲'],
          rating: 4.4,
          matchScore: 85
        },
        {
          id: 6,
          name: '示例景点6',
          description: '这里有丰富的历史文化遗产，值得一游。',
          image: 'https://via.placeholder.com/400x300?text=历史古迹',
          tags: ['历史古迹', '教育'],
          rating: 4.2,
          matchScore: 78
        }
      ]
      loading.value = false
    }, 1000)
    
  } catch (err) {
    error.value = '加载推荐信息失败，请稍后重试'
    loading.value = false
    console.error(err)
  }
}

const viewDetail = (id) => {
  router.push(`/attractions/${id}`)
}
</script>

<style lang="less" scoped>
@import '../styles/variables.less';

.recommendations {
  max-width: 1200px;
  margin: 0 auto;
  padding: @spacing-lg 0;
}

.page-header {
  text-align: center;
  margin-bottom: @spacing-xl;
  
  h1 {
    font-size: 32px;
    margin-bottom: @spacing-sm;
  }
  
  p {
    color: @text-color-secondary;
    font-size: @font-size-lg;
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

.recommendation-categories {
  display: flex;
  flex-wrap: wrap;
  gap: @spacing-md;
  margin-bottom: @spacing-xl;
  justify-content: center;
  
  .category-tab {
    padding: @spacing-sm @spacing-lg;
    border-radius: @border-radius-lg;
    background-color: @bg-color-light;
    cursor: pointer;
    .hover-transition();
    
    &:hover {
      background-color: lighten(@primary-color, 35%);
    }
    
    &.active {
      background-color: @primary-color;
      color: @text-color-inverse;
    }
  }
}

.recommendations-grid {
  display: grid;
  gap: @spacing-lg;
  
  @media (min-width: @screen-sm) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: @screen-lg) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.attraction-card {
  .card();
  cursor: pointer;
  
  .card-image {
    position: relative;
    aspect-ratio: 4/3;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      .hover-transition();
    }
    
    .card-tags {
      position: absolute;
      top: @spacing-sm;
      left: @spacing-sm;
      display: flex;
      gap: @spacing-xs;
      
      .tag {
        background-color: rgba(0, 0, 0, 0.6);
        color: white;
        padding: 2px 8px;
        border-radius: @border-radius-sm;
        font-size: @font-size-sm;
      }
    }
  }
  
  &:hover {
    .card-image img {
      transform: scale(1.05);
    }
  }
  
  .card-content {
    padding: @spacing-md;
    
    h3 {
      font-size: @font-size-lg;
      margin-bottom: @spacing-xs;
      .text-ellipsis();
    }
    
    .description {
      color: @text-color-secondary;
      .multi-ellipsis(2);
      margin-bottom: @spacing-md;
    }
    
    .card-footer {
      .flex-between();
      
      .rating {
        display: flex;
        align-items: center;
        gap: @spacing-xs;
      }
      
      .match {
        color: @success-color;
        font-weight: bold;
      }
    }
  }
}

.no-recommendations {
  text-align: center;
  padding: @spacing-xl;
  
  p {
    margin-bottom: @spacing-lg;
    color: @text-color-secondary;
  }
}
</style> 