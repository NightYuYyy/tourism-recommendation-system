<template>
  <div class="attraction-detail">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <el-skeleton :loading="true" animated>
        <template #template>
          <div class="skeleton-content">
            <el-skeleton-item variant="image" style="width: 100%; height: 400px; margin-bottom: 20px;" />
            <el-skeleton-item variant="h1" style="width: 50%" />
            <div style="margin: 20px 0">
              <el-skeleton-item variant="text" style="width: 80%" />
              <el-skeleton-item variant="text" style="width: 60%" />
            </div>
            <el-row :gutter="20">
              <el-col :span="16">
                <el-skeleton-item variant="text" style="width: 100%; height: 300px" />
              </el-col>
              <el-col :span="8">
                <el-skeleton-item variant="text" style="width: 100%; height: 300px" />
              </el-col>
            </el-row>
          </div>
        </template>
      </el-skeleton>
    </div>
    
    <!-- 错误状态 -->
    <el-result
      v-else-if="error"
      icon="error"
      :title="error"
      sub-title="请稍后重试"
    >
      <template #extra>
        <el-button type="primary" @click="fetchAttractionDetail">
          重试
        </el-button>
      </template>
    </el-result>
    
    <!-- 景点内容 -->
    <template v-else>
      <!-- 景点头部信息 -->
      <el-card class="attraction-header">
        <el-carousel 
          v-if="attraction.images?.length"
          height="400px"
          :interval="4000"
          type="card"
        >
          <el-carousel-item v-for="image in attraction.images" :key="image">
            <el-image 
              :src="image" 
              fit="cover"
              :preview-src-list="attraction.images"
            />
          </el-carousel-item>
        </el-carousel>
        <el-image
          v-else
          :src="attraction.image || 'https://via.placeholder.com/800x400?text=景点图片'"
          :alt="attraction.name"
          fit="cover"
          class="main-image"
          :preview-src-list="[attraction.image]"
        />
        
        <div class="attraction-info">
          <el-page-header 
            :title="attraction.name"
            @back="router.back()"
          >
            <template #content>
              <div class="flex items-center">
                <el-tag v-if="attraction.isPopular" type="danger" effect="dark" class="mr-2">
                  <el-icon><Star /></el-icon>
                  <span class="ml-1">热门</span>
                </el-tag>
                <span class="page-header__title">{{ attraction.name }}</span>
              </div>
            </template>
          </el-page-header>
          
          <div class="meta-info">
            <div class="rating">
              <el-rate 
                v-model="attraction.rating" 
                disabled 
                show-score
                text-color="#ff9900"
              />
              <span class="review-count">({{ attraction.reviewCount || 0 }}条评价)</span>
            </div>
            
            <div class="tags">
              <el-tag 
                v-for="tag in attraction.tags" 
                :key="tag" 
                class="mr-2"
                effect="plain"
              >
                {{ tag }}
              </el-tag>
            </div>
            
            <div class="location">
              <el-link :underline="false" type="info">
                <el-icon><Location /></el-icon>
                <span>{{ attraction.location }}</span>
              </el-link>
            </div>
          </div>
        </div>
      </el-card>
      
      <!-- 景点详细信息 -->
      <el-row :gutter="20" class="detail-content">
        <el-col :span="16" class="main-content">
          <el-tabs>
            <el-tab-pane label="景点介绍">
              <el-card class="mb-4">
                <template #header>
                  <div class="card-header">
                    <span>景点介绍</span>
                  </div>
                </template>
                <p>{{ attraction.description }}</p>
              </el-card>
              
              <el-card class="mb-4">
                <template #header>
                  <div class="card-header">
                    <span>特色亮点</span>
                  </div>
                </template>
                <el-timeline>
                  <el-timeline-item
                    v-for="(feature, index) in attraction.features"
                    :key="index"
                    :type="['primary', 'success', 'warning', 'danger'][index % 4]"
                  >
                    {{ feature }}
                  </el-timeline-item>
                </el-timeline>
              </el-card>
              
              <el-card class="mb-4">
                <template #header>
                  <div class="card-header">
                    <span>游玩贴士</span>
                  </div>
                </template>
                <el-collapse>
                  <el-collapse-item
                    v-for="(tip, index) in attraction.tips"
                    :key="index"
                    :title="tip.title"
                  >
                    {{ tip.content }}
                  </el-collapse-item>
                </el-collapse>
              </el-card>
            </el-tab-pane>
            
            <el-tab-pane label="游客评价">
              <el-card>
                <template #header>
                  <div class="card-header">
                    <span>游客评价</span>
                    <el-button v-if="isLoggedIn" type="primary" @click="showReviewDialog = true">
                      写评价
                    </el-button>
                    <el-button v-else type="primary" @click="router.push('/login')">
                      登录后评价
                    </el-button>
                  </div>
                </template>
                
                <div v-if="attraction.reviews?.length" class="reviews">
                  <el-timeline>
                    <el-timeline-item
                      v-for="review in attraction.reviews"
                      :key="review.id"
                      :timestamp="review.date"
                      placement="top"
                    >
                      <el-card class="review-card">
                        <template #header>
                          <div class="review-header">
                            <el-avatar :size="32">{{ review.username.charAt(0) }}</el-avatar>
                            <span class="reviewer">{{ review.username }}</span>
                            <el-rate 
                              v-model="review.rating" 
                              disabled 
                              show-score
                              text-color="#ff9900"
                            />
                          </div>
                        </template>
                        <p>{{ review.content }}</p>
                      </el-card>
                    </el-timeline-item>
                  </el-timeline>
                </div>
                <el-empty v-else description="暂无评价" />
              </el-card>
            </el-tab-pane>
          </el-tabs>
        </el-col>
        
        <el-col :span="8" class="sidebar">
          <el-affix :offset="80">
            <el-card class="mb-4">
              <template #header>
                <div class="card-header">
                  <span>开放时间</span>
                </div>
              </template>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="营业时间">
                  {{ attraction.openingHours || '暂无信息' }}
                </el-descriptions-item>
              </el-descriptions>
            </el-card>
            
            <el-card class="mb-4">
              <template #header>
                <div class="card-header">
                  <span>门票信息</span>
                </div>
              </template>
              <div class="ticket-info">
                <div class="price">
                  <span class="currency">¥</span>
                  <span class="amount">{{ attraction.price || '免费' }}</span>
                </div>
                <el-button type="primary" class="w-full">预订门票</el-button>
              </div>
            </el-card>
            
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>附近景点</span>
                </div>
              </template>
              <el-scrollbar height="300px">
                <el-list>
                  <el-list-item
                    v-for="item in nearbyAttractions"
                    :key="item.id"
                    @click="goToAttraction(item.id)"
                  >
                    <template #prefix>
                      <el-image
                        :src="item.image"
                        :alt="item.name"
                        style="width: 60px; height: 60px"
                        fit="cover"
                      >
                        <template #error>
                          <div class="image-slot">
                            <el-icon><Picture /></el-icon>
                          </div>
                        </template>
                      </el-image>
                    </template>
                    <template #default>
                      <div class="nearby-info">
                        <h4>{{ item.name }}</h4>
                        <p>{{ item.distance }}km</p>
                      </div>
                    </template>
                  </el-list-item>
                </el-list>
              </el-scrollbar>
            </el-card>
          </el-affix>
        </el-col>
      </el-row>
    </template>

    <!-- 评价对话框 -->
    <el-dialog
      v-model="showReviewDialog"
      title="写评价"
      width="500px"
    >
      <el-form :model="reviewForm" :rules="reviewRules" ref="reviewFormRef">
        <el-form-item label="评分" prop="rating">
          <el-rate 
            v-model="reviewForm.rating"
            show-score
            text-color="#ff9900"
          />
        </el-form-item>
        <el-form-item label="评价内容" prop="content">
          <el-input
            type="textarea"
            v-model="reviewForm.content"
            placeholder="分享您的游玩体验..."
            :rows="4"
            show-word-limit
            maxlength="500"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showReviewDialog = false">取消</el-button>
          <el-button type="primary" @click="submitReview" :loading="submitting">
            提交
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { useAttractionStore } from '../store/attractions'
import { ElMessage } from 'element-plus'
import { 
  Star, 
  Location, 
  Picture 
} from '@element-plus/icons-vue'
import request from '@/utils/request'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const attractionStore = useAttractionStore()

const attractionId = computed(() => route.params.id)
const isLoggedIn = computed(() => userStore.isAuthenticated)

const attraction = computed(() => attractionStore.currentAttraction || {})
const loading = computed(() => attractionStore.loading)
const error = computed(() => attractionStore.error)
const nearbyAttractions = ref([])

// 评价相关
const showReviewDialog = ref(false)
const reviewFormRef = ref(null)
const submitting = ref(false)

const reviewForm = ref({
  rating: 5,
  content: ''
})

const reviewRules = {
  rating: [
    { required: true, message: '请选择评分', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入评价内容', trigger: 'blur' },
    { min: 10, message: '评价内容至少10个字', trigger: 'blur' }
  ]
}

onMounted(() => {
  fetchAttractionDetail()
})

const fetchAttractionDetail = async () => {
  try {
    // 使用store的方法获取景点详情
    await attractionStore.fetchAttractionById(attractionId.value)
    
    // 获取附近景点
    const { data: nearby } = await request.get(`/attractions/${attractionId.value}/nearby`)
    nearbyAttractions.value = nearby
  } catch (err) {
    console.error(err)
  }
}

const submitReview = async () => {
  if (!reviewFormRef.value) return
  
  try {
    await reviewFormRef.value.validate()
    submitting.value = true
    
    await request.post(`/attractions/${attractionId.value}/reviews`, reviewForm.value)
    
    ElMessage.success('评价提交成功！')
    showReviewDialog.value = false
    reviewForm.value = { rating: 5, content: '' }
    
    // 重新获取景点信息（包含最新评价）
    fetchAttractionDetail()
  } catch (err) {
    if (err.name === 'ValidationError') {
      // 表单验证错误，已经显示在表单上
      return
    }
    ElMessage.error('评价提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const goToAttraction = (id) => {
  router.push(`/attractions/${id}`)
}
</script>

<style lang="less" scoped>
.attraction-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.loading {
  padding: 24px;
}

.attraction-header {
  margin-bottom: 24px;
  
  .main-image {
    width: 100%;
    height: 400px;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .attraction-info {
    padding: 20px 0;
  }
}

.meta-info {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  
  .rating {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .review-count {
      color: var(--el-text-color-secondary);
    }
  }
  
  .location {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.detail-content {
  margin-top: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.review-card {
  .review-header {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .reviewer {
      font-weight: 500;
    }
  }
}

.ticket-info {
  text-align: center;
  
  .price {
    margin-bottom: 16px;
    color: var(--el-color-danger);
    
    .currency {
      font-size: 16px;
      margin-right: 4px;
    }
    
    .amount {
      font-size: 32px;
      font-weight: bold;
    }
  }
}

.nearby-info {
  h4 {
    margin: 0 0 4px;
    font-size: 14px;
  }
  
  p {
    margin: 0;
    color: var(--el-text-color-secondary);
    font-size: 12px;
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
  font-size: 20px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mr-2 {
  margin-right: 8px;
}

.ml-1 {
  margin-left: 4px;
}

.w-full {
  width: 100%;
}

:deep(.el-carousel__item) {
  .el-image {
    width: 100%;
    height: 100%;
  }
}
</style> 