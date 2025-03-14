<template>
  <div class="attractions-page">
    <!-- 搜索和筛选区域 -->
    <section class="filter-section">
      <div class="search-box">
        <input
          v-model="filters.search"
          type="text"
          placeholder="搜索景点..."
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
        
        <el-slider
          v-model="filters.priceRange"
          range
          :min="0"
          :max="1000"
          :step="50"
        />
      </div>
    </section>

    <!-- 景点列表 -->
    <section class="attractions-grid">
      <div 
        v-for="attraction in filteredAttractions"
        :key="attraction.id"
        class="attraction-card"
        @click="viewDetail(attraction.id)"
      >
        <div class="card-image">
          <img :src="attraction.image" :alt="attraction.name" />
          <div class="card-badges">
            <span class="badge" v-if="attraction.isPopular">热门</span>
            <span class="badge" v-if="attraction.isNew">新增</span>
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
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </div>
    </section>

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
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const store = useStore()
const router = useRouter()

// 分页相关
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

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

// 获取景点数据
const fetchData = async () => {
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      ...filters
    }
    await store.dispatch('fetchAttractions', params)
  } catch (error) {
    ElMessage.error('获取景点数据失败')
  }
}

// 计算属性：过滤后的景点列表
const filteredAttractions = computed(() => {
  return store.state.attractions
})

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

.filter-section {
  margin-bottom: @spacing-xl;
  padding: @spacing-lg;
  background: @bg-color;
  border-radius: @border-radius-lg;
  box-shadow: @box-shadow-base;

  .search-box {
    margin-bottom: @spacing-lg;
    
    input {
      width: 100%;
      height: 44px;
      padding: 0 @spacing-lg;
      border: 1px solid @border-color;
      border-radius: @border-radius-base;
      font-size: @font-size-lg;
      
      &:focus {
        border-color: @primary-color;
        box-shadow: 0 0 0 3px fade(@primary-color, 10%);
      }
    }
  }

  .filter-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: @spacing-lg;
  }
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
  .card();
  cursor: pointer;
  .hover-transition();
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: @box-shadow-lg;
  }

  .card-image {
    position: relative;
    aspect-ratio: 16/9;
    overflow: hidden;
    border-radius: @border-radius-base @border-radius-base 0 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      .hover-transition();
    }

    .card-badges {
      position: absolute;
      top: @spacing-sm;
      right: @spacing-sm;
      display: flex;
      gap: @spacing-xs;

      .badge {
        padding: @spacing-xs @spacing-sm;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        border-radius: @border-radius-sm;
        font-size: @font-size-sm;
      }
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