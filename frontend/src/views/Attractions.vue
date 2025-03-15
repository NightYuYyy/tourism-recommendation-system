<template>
  <div class="attractions-page">
    <!-- 页面标题 -->
    <el-page-header class="page-header">
      <template #content>
        <div class="page-title">
          <h1>探索景点</h1>
          <p>发现令人惊叹的旅游胜地，开启您的完美旅程</p>
        </div>
      </template>
    </el-page-header>
    
    <!-- 搜索和筛选区域 -->
    <el-card class="filter-section">
      <el-form :model="filters" label-position="top">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="搜索">
              <el-input
                v-model="filters.search"
                placeholder="搜索景点..."
                clearable
                @input="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          
          <el-col :span="6">
            <el-form-item label="分类">
              <el-select 
                v-model="filters.category" 
                placeholder="选择分类" 
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="category in categories"
                  :key="category.value"
                  :label="category.label"
                  :value="category.value"
                >
                  <template #default="{ label }">
                    <el-icon><FolderOpened /></el-icon>
                    <span class="ml-2">{{ label }}</span>
                  </template>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="6">
            <el-form-item label="排序方式">
              <el-select 
                v-model="filters.sortBy" 
                placeholder="排序方式"
                style="width: 100%"
              >
                <el-option label="评分最高" value="rating">
                  <template #default>
                    <el-icon><StarFilled /></el-icon>
                    <span class="ml-2">评分最高</span>
                  </template>
                </el-option>
                <el-option label="最新添加" value="created">
                  <template #default>
                    <el-icon><Timer /></el-icon>
                    <span class="ml-2">最新添加</span>
                  </template>
                </el-option>
                <el-option label="最多评论" value="comments">
                  <template #default>
                    <el-icon><ChatDotRound /></el-icon>
                    <span class="ml-2">最多评论</span>
                  </template>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="24">
            <el-form-item label="价格范围">
              <el-slider
                v-model="filters.priceRange"
                range
                :min="0"
                :max="1000"
                :step="50"
                :marks="{
                  0: '¥0',
                  250: '¥250',
                  500: '¥500',
                  750: '¥750',
                  1000: '¥1000'
                }"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 加载状态 -->
    <div v-if="attractionStore.loading" class="loading-container">
      <el-skeleton :loading="true" animated>
        <template #template>
          <el-row :gutter="20">
            <el-col 
              v-for="i in 6" 
              :key="i"
              :xs="24"
              :sm="12"
              :md="8"
              :lg="8"
              class="mb-4"
            >
              <el-skeleton-item variant="image" style="width: 100%; height: 200px" />
              <div style="padding: 14px">
                <el-skeleton-item variant="h3" style="width: 50%" />
                <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 16px">
                  <el-skeleton-item variant="text" style="width: 60%" />
                  <el-skeleton-item variant="text" style="width: 30%" />
                </div>
              </div>
            </el-col>
          </el-row>
        </template>
      </el-skeleton>
    </div>

    <!-- 错误状态 -->
    <el-result
      v-if="attractionStore.error"
      icon="error"
      :title="attractionStore.error"
      sub-title="请稍后重试或联系管理员"
    >
      <template #extra>
        <el-button type="primary" @click="fetchData">重试</el-button>
      </template>
    </el-result>

    <!-- 景点列表 -->
    <template v-if="!attractionStore.loading && !attractionStore.error">
      <el-empty
        v-if="attractions.length === 0"
        description="暂无符合条件的景点"
        :image-size="200"
      >
        <template #extra>
          <el-button type="primary" @click="resetFilters">重置筛选</el-button>
        </template>
      </el-empty>
      
      <el-row v-else :gutter="20">
        <el-col 
          v-for="attraction in attractions"
          :key="attraction.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="8"
          class="mb-4"
        >
          <el-card
            class="attraction-card"
            :body-style="{ padding: '0' }"
            shadow="hover"
            @click="viewDetail(attraction.id)"
          >
            <el-image 
              class="card-image"
              :src="attraction.image || 'https://via.placeholder.com/300x200?text=景点图片'" 
              :alt="attraction.name"
              fit="cover"
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            
            <div class="card-badges">
              <el-tag v-if="attraction.isPopular" type="danger" effect="dark" size="small">
                <el-icon><Star /></el-icon>
                <span class="ml-1">热门</span>
              </el-tag>
              <el-tag v-if="attraction.isNew" type="success" effect="dark" size="small">
                <el-icon><New /></el-icon>
                <span class="ml-1">新增</span>
              </el-tag>
            </div>
            
            <div class="card-content">
              <h3>{{ attraction.name }}</h3>
              <p class="description">{{ attraction.description }}</p>
              
              <div class="meta-info">
                <div class="rating">
                  <el-rate 
                    v-model="attraction.rating" 
                    disabled 
                    show-score
                    text-color="#ff9900"
                  />
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
        </el-col>
      </el-row>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[12, 24, 36, 48]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Search, 
  FolderOpened, 
  StarFilled, 
  Timer, 
  ChatDotRound,
  Picture,
  Star,
  New
} from '@element-plus/icons-vue'
import { useAttractionStore } from '../store/modules/attractions'
import request from '@/utils/request'

const router = useRouter()
const route = useRoute()
const attractionStore = useAttractionStore()

// 分页相关
const currentPage = ref(1)
const pageSize = ref(12)
const total = computed(() => attractionStore.pagination.total)

// 筛选条件
const filters = reactive({
  search: route.query.search || '',
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
const attractions = computed(() => attractionStore.attractions)

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

// 重置筛选条件
const resetFilters = () => {
  filters.search = ''
  filters.category = ''
  filters.sortBy = 'rating'
  filters.priceRange = [0, 1000]
  currentPage.value = 1
  fetchData()
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
.attractions-page {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
  
  .page-title {
    text-align: center;
    
    h1 {
      font-size: 32px;
      margin-bottom: 8px;
      color: var(--el-text-color-primary);
    }
    
    p {
      font-size: 16px;
      color: var(--el-text-color-secondary);
    }
  }
}

.filter-section {
  margin-bottom: 24px;
}

.loading-container {
  margin: 24px 0;
}

.attraction-card {
  height: 100%;
  cursor: pointer;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
  }
  
  .card-image {
    width: 100%;
    height: 200px;
  }

  .card-badges {
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    gap: 8px;
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

    .description {
      color: var(--el-text-color-secondary);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: 16px;
      min-height: 40px;
    }

    .meta-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .price {
        font-size: 20px;
        color: var(--el-color-danger);
        font-weight: bold;

        .currency {
          font-size: 14px;
        }
      }
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
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

.pagination {
  margin-top: 32px;
  display: flex;
  justify-content: center;
}

.mb-4 {
  margin-bottom: 16px;
}

.ml-1 {
  margin-left: 4px;
}

.ml-2 {
  margin-left: 8px;
}
</style>