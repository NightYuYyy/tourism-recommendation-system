<template>
  <div class="home">
    <!-- Hero Section -->
    <el-card class="hero" :body-style="{ padding: 0 }">
      <div class="hero-content">
        <h1>发现精彩景点</h1>
        <p>基于个性化推荐算法，为您推荐最适合的旅游目的地</p>
        <div class="search-box">
          <el-input
            v-model="searchQuery"
            placeholder="搜索景点..."
            size="large"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #append>
              <el-button type="primary" @click="handleSearch">
                搜索
              </el-button>
            </template>
          </el-input>
        </div>
      </div>
    </el-card>

    <!-- Featured Attractions -->
    <section class="featured">
      <div class="section-header">
        <h2>热门景点</h2>
        <el-link type="primary" :href="'/attractions'">
          查看全部 <el-icon><ArrowRight /></el-icon>
        </el-link>
      </div>
      
      <el-row :gutter="20">
        <el-col 
          v-for="attraction in featuredAttractions" 
          :key="attraction.id"
          :xs="24"
          :sm="12"
          :md="8"
          class="mb-4"
        >
          <el-card 
            class="attraction-card" 
            :body-style="{ padding: '0px' }"
            shadow="hover"
          >
            <el-image
              :src="attraction.image"
              :alt="attraction.name"
              fit="cover"
              class="card-image"
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div class="card-content">
              <h3>{{ attraction.name }}</h3>
              <p>{{ attraction.description }}</p>
              <div class="card-footer">
                <div class="rating">
                  <el-rate 
                    v-model="attraction.rating" 
                    disabled 
                    show-score
                    text-color="#ff9900"
                  />
                </div>
                <el-button 
                  type="primary" 
                  text
                  @click="viewDetail(attraction.id)"
                >
                  查看详情
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </section>

    <!-- Categories -->
    <section class="categories">
      <h2>景点分类</h2>
      <el-row :gutter="20">
        <el-col 
          v-for="category in categories" 
          :key="category.id"
          :xs="12"
          :sm="8"
          :md="4"
          class="mb-4"
        >
          <el-card 
            class="category-card" 
            shadow="hover"
            :body-style="{ padding: '0px' }"
          >
            <el-image
              :src="category.image"
              :alt="category.name"
              fit="cover"
              class="category-image"
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div class="category-content">
              <span class="category-name">{{ category.name }}</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, ArrowRight, Picture } from '@element-plus/icons-vue'
import request from '@/utils/request'

const router = useRouter()
const searchQuery = ref('')
const featuredAttractions = ref([])
const categories = ref([
  { id: 1, name: '自然风光', image: '/images/nature.jpg' },
  { id: 2, name: '历史古迹', image: '/images/historical.jpg' },
  { id: 3, name: '主题乐园', image: '/images/theme-park.jpg' },
  { id: 4, name: '文化场所', image: '/images/cultural.jpg' },
  { id: 5, name: '美食街区', image: '/images/food.jpg' },
  { id: 6, name: '购物天堂', image: '/images/shopping.jpg' },
])

onMounted(async () => {
  await fetchFeaturedAttractions()
})

const fetchFeaturedAttractions = async () => {
  try {
    const { data } = await request.get('/attractions/featured')
    featuredAttractions.value = data
  } catch (error) {
    ElMessage.error('获取热门景点失败')
    // 使用示例数据作为后备
    featuredAttractions.value = [
      {
        id: 1,
        name: '示例景点1',
        description: '这是一个示例景点描述',
        image: 'https://example.com/image1.jpg',
        rating: 4.5
      },
      // ... 更多示例数据
    ]
  }
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/attractions',
      query: { search: searchQuery.value }
    })
  }
}

const viewDetail = (id) => {
  router.push(`/attractions/${id}`)
}
</script>

<style lang="less" scoped>
.home {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
}

.hero {
  position: relative;
  background: var(--el-color-primary-light-3);
  margin-bottom: 32px;
  overflow: hidden;

  &-content {
    position: relative;
    max-width: 800px;
    margin: 0 auto;
    padding: 48px 24px;
    text-align: center;
    color: var(--el-color-white);

    h1 {
      font-size: 48px;
      margin-bottom: 16px;
    }

    p {
      font-size: 18px;
      margin-bottom: 24px;
      opacity: 0.9;
    }
  }
}

.search-box {
  max-width: 600px;
  margin: 0 auto;

  :deep(.el-input__wrapper) {
    background-color: var(--el-color-white);
  }

  :deep(.el-input-group__append) {
    padding: 0;
    
    .el-button {
      margin: 0;
      border: none;
      height: 40px;
      padding: 0 20px;
    }
  }
}

.attraction-card {
  height: 100%;
  
  .card-image {
    width: 100%;
    height: 200px;
  }

  .card-content {
    padding: 16px;

    h3 {
      font-size: 18px;
      margin-bottom: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    p {
      color: var(--el-text-color-secondary);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: 16px;
    }
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.category-card {
  cursor: pointer;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
  }

  .category-image {
    width: 100%;
    height: 120px;
  }

  .category-content {
    padding: 12px;
    text-align: center;
  }

  .category-name {
    font-size: 16px;
    font-weight: 500;
  }
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 30px;
}

.mb-4 {
  margin-bottom: 16px;
}
</style>