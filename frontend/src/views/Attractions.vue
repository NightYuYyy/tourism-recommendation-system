<template>
  <div class="attractions-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>探索景点</h1>
      <p>发现令人惊叹的旅游胜地，开启您的完美旅程</p>
    </div>
    
    <!-- 搜索和筛选区域 -->
    <el-card class="filter-section">
      <div class="search-box">
        <el-input
          v-model="filters.search"
          placeholder="搜索景点..."
          prefix-icon="Search"
          clearable
          @input="handleSearch"
        />
      </div>
      
      <div class="filter-options">
        <el-select v-model="filters.category" placeholder="选择分类" clearable>
          <el-option
            v-for="category in categories"
            :key="category.value"
            :label="category.label"
            :value="category.value"
          />
        </el-select>
        
        <el-select v-model="filters.sortBy" placeholder="排序方式">
          <el-option label="评分最高" value="rating" />
          <el-option label="最新添加" value="created" />
          <el-option label="最多评论" value="comments" />
        </el-select>
        
        <div class="price-filter">
          <span class="filter-label">价格范围</span>
          <el-slider
            v-model="filters.priceRange"
            range
            :min="0"
            :max="1000"
            :step="50"
            :marks="{0: '¥0', 500: '¥500', 1000: '¥1000'}"
          />
        </div>
      </div>
    </el-card>

    <!-- 加载状态 -->
    <div v-if="attractionStore.loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- 错误状态 -->
    <el-alert
      v-if="attractionStore.error"
      :title="attractionStore.error"
      type="error"
      show-icon
      :closable="false"
      class="mb-lg"
    />

    <!-- 景点列表 -->
    <div v-if="!attractionStore.loading && !attractionStore.error">
      <div v-if="attractions.length === 0" class="empty-state">
        <el-empty description="暂无符合条件的景点" />
      </div>
      
      <div v-else class="attractions-grid">
        <el-card
          v-for="attraction in attractions"
          :key="attraction.id"
          class="attraction-card"
          :body-style="{ padding: '0' }"
          @click="viewDetail(attraction.id)"
        >
          <div class="card-image">
            <el-image 
              :src="attraction.image || 'https://via.placeholder.com/300x200?text=景点图片'" 
              :alt="attraction.name"
              fit="cover"
            />
            <div class="card-badges">
              <el-tag v-if="attraction.isPopular" type="danger" effect="dark" size="small">热门</el-tag>
              <el-tag v-if="attraction.isNew" type="success" effect="dark" size="small">新增</el-tag>
            </div>
          </div>
          
          <div class="card-content">
            <h3>{{ attraction.name }}</h3>
            <p class="description">{{ attraction.description }}</p>
            
            <div class="meta-info">
              <div class="rating">
                <el-rate v-model="attraction.rating" disabled />
                <span>{{ attraction.rating }}分</span>
              </div>
              <div class="price">
                <span class="currency">¥</span>
                <span class="amount">{{ attraction.price }}</span>
              </div>
            </div>
            
            <div class="tags">
              <el-tag 
                v-for="tag in attraction.tags"
                :key="tag"
                size="small"
                effect="plain"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[12, 24, 36, 48]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { useAttractionStore } from '../store/modules/attractions'

const router = useRouter()
const attractionStore = useAttractionStore()

// 分页相关
const currentPage = ref(1)
const pageSize = ref(12)
const total = computed(() => attractionStore.pagination.total)

// 筛选条件
const filters = reactive({
  search: '',
  category: '',
  sortBy: 'rating',
  priceRange: [0, 1000]
})

// 分类选项
const categories = [
  { value: 'nature', label: '自然风光' },
  { value: 'culture', label: '文化古迹' },
  { value: 'entertainment', label: '娱乐场所' },
  { value: 'food', label: '美食街区' },
  { value: 'shopping', label: '购物中心' }
]

// 计算属性：景点列表
const attractions = computed(() => {
  return attractionStore.attractions
})

// 获取景点数据
const fetchData = async () => {
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      search: filters.search,
      category: filters.category,
      sortBy: filters.sortBy,
      minPrice: filters.priceRange[0],
      maxPrice: filters.priceRange[1]
    }
    
    await attractionStore.fetchAttractions(params)
  } catch (error) {
    console.error('获取景点数据失败', error)
  }
}

// 事件处理
const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchData()
}

const viewDetail = (id) => {
  router.push(`/attractions/${id}`)
}

// 监听筛选条件变化
watch([() => filters.category, () => filters.sortBy, () => filters.priceRange], () => {
  currentPage.value = 1
  fetchData()
}, { deep: true })

// 生命周期钩子
onMounted(() => {
  fetchData()
})
</script>

<style lang="less" scoped>
@import '../styles/variables.less';

.attractions-page {
  padding: @spacing-lg;
}

.page-header {
  text-align: center;
  margin-bottom: @spacing-xl;
  
  h1 {
    font-size: 32px;
    margin-bottom: @spacing-sm;
    color: @text-color;
  }
  
  p {
    font-size: @font-size-lg;
    color: @text-color-secondary;
  }
}

.filter-section {
  margin-bottom: @spacing-xl;
  
  .search-box {
    margin-bottom: @spacing-lg;
  }
  
  .filter-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: @spacing-lg;
    
    .price-filter {
      .filter-label {
        display: block;
        margin-bottom: @spacing-sm;
        color: @text-color-secondary;
      }
    }
  }
}

.loading-container {
  padding: @spacing-xl;
}

.empty-state {
  padding: @spacing-xl;
  text-align: center;
}

.attractions-grid {
  display: grid;
  gap: @spacing-lg;
  margin-bottom: @spacing-xl;
  
  @media (min-width: @screen-sm) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: @screen-md) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (min-width: @screen-lg) {
    grid-template-columns: repeat(4, 1fr);
  }
}

.attraction-card {
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: @box-shadow-lg;
  }

  .card-image {
    position: relative;
    height: 200px;
    overflow: hidden;
    
    .el-image {
      width: 100%;
      height: 100%;
    }

    .card-badges {
      position: absolute;
      top: @spacing-sm;
      right: @spacing-sm;
      display: flex;
      gap: @spacing-xs;
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
      min-height: 42px;
    }

    .meta-info {
      .flex-between();
      margin-bottom: @spacing-sm;

      .rating {
        .flex-center();
        gap: @spacing-xs;
      }

      .price {
        color: @primary-color;
        font-weight: 500;

        .currency {
          font-size: @font-size-sm;
        }

        .amount {
          font-size: @font-size-lg;
        }
      }
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: @spacing-xs;
    }
  }
}

.pagination {
  .flex-center();
  margin-top: @spacing-xl;
}
</style>