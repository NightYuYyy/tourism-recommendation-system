<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1>发现精彩景点</h1>
        <p>基于个性化推荐算法，为您推荐最适合的旅游目的地</p>
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索景点..."
            @keyup.enter="handleSearch"
          />
          <button class="btn btn-primary" @click="handleSearch">
            搜索
          </button>
        </div>
      </div>
    </section>

    <!-- Featured Attractions -->
    <section class="featured">
      <div class="section-header">
        <h2>热门景点</h2>
        <router-link to="/attractions" class="view-all">
          查看全部 →
        </router-link>
      </div>
      
      <div class="attractions-grid">
        <div 
          v-for="attraction in featuredAttractions" 
          :key="attraction.id" 
          class="attraction-card"
        >
          <div class="card-image">
            <img :src="attraction.image" :alt="attraction.name" />
          </div>
          <div class="card-content">
            <h3>{{ attraction.name }}</h3>
            <p>{{ attraction.description }}</p>
            <div class="card-footer">
              <div class="rating">
                <el-rate v-model="attraction.rating" disabled></el-rate>
                <span>{{ attraction.rating }}</span>
              </div>
              <button 
                class="btn btn-text"
                @click="viewDetail(attraction.id)"
              >
                查看详情
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="categories">
      <h2>景点分类</h2>
      <div class="categories-grid">
        <div 
          v-for="category in categories" 
          :key="category.id"
          class="category-card"
        >
          <img :src="category.image" :alt="category.name" />
          <span class="category-name">{{ category.name }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

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
  // TODO: 从API获取热门景点数据
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
@import '../styles/variables.less';

.home {
  .section-header {
    .flex-between();
    margin-bottom: @spacing-lg;
  }
}

.hero {
  position: relative;
  background: linear-gradient(135deg, @primary-color 0%, @primary-color-dark 100%);
  border-radius: @border-radius-lg;
  overflow: hidden;
  margin-bottom: @spacing-xl;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('/images/hero-pattern.svg');
    opacity: 0.1;
  }

  &-content {
    position: relative;
    max-width: 800px;
    margin: 0 auto;
    padding: @spacing-xl;
    text-align: center;
    color: @text-color-inverse;

    h1 {
      font-size: 48px;
      margin-bottom: @spacing-md;
    }

    p {
      font-size: @font-size-lg;
      margin-bottom: @spacing-lg;
    }
  }
}

.search-box {
  display: flex;
  max-width: 600px;
  margin: 0 auto;
  gap: @spacing-xs;

  input {
    flex: 1;
    height: 48px;
    padding: 0 @spacing-lg;
    border-radius: @border-radius-lg;
    border: none;
    font-size: @font-size-lg;

    &:focus {
      outline: none;
      box-shadow: 0 0 0 3px fade(@primary-color-light, 50%);
    }
  }

  button {
    height: 48px;
    padding: 0 @spacing-lg;
    font-size: @font-size-lg;
  }
}

.attractions-grid {
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
  overflow: hidden;

  .card-image {
    aspect-ratio: 16/9;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      .hover-transition();
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

    p {
      color: @text-color-secondary;
      .multi-ellipsis(2);
      margin-bottom: @spacing-md;
    }
  }

  .card-footer {
    .flex-between();

    .rating {
      .flex-center();
      gap: @spacing-xs;
    }
  }
}

.categories {
  margin-top: @spacing-xl;

  h2 {
    margin-bottom: @spacing-lg;
  }
}

.categories-grid {
  display: grid;
  gap: @spacing-md;
  grid-template-columns: repeat(2, 1fr);
  
  @media (min-width: @screen-sm) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (min-width: @screen-lg) {
    grid-template-columns: repeat(6, 1fr);
  }
}

.category-card {
  position: relative;
  aspect-ratio: 1;
  border-radius: @border-radius-lg;
  overflow: hidden;
  .hover-transition();

  &:hover {
    transform: translateY(-4px);

    img {
      transform: scale(1.1);
    }
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    .hover-transition();
  }

  .category-name {
    position: absolute;
    inset: 0;
    .flex-center();
    background: rgba(0, 0, 0, 0.4);
    color: @text-color-inverse;
    font-weight: 500;
  }
}
</style>