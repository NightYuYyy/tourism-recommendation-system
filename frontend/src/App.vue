<template>
  <div class="app">
    <el-container>
      <el-header height="64px" class="header">
        <div class="container">
          <div class="nav flex justify-between items-center">
            <div class="nav-left flex items-center gap-md">
              <router-link to="/" class="logo">
                <el-icon class="mr-2"><Location /></el-icon>
                旅游推荐
              </router-link>
              <div class="nav-links hide-sm">
                <el-menu mode="horizontal" :router="true" :ellipsis="false" class="border-0">
                  <el-menu-item index="/attractions">景点</el-menu-item>
                  <el-menu-item index="/recommendations">推荐</el-menu-item>
                </el-menu>
              </div>
            </div>
            
            <div class="nav-right flex items-center gap-sm">
              <template v-if="isLoggedIn">
                <el-dropdown trigger="click">
                  <el-avatar :size="32" :src="userAvatar">{{ userInitials }}</el-avatar>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="goToProfile">
                        <el-icon><User /></el-icon>
                        个人中心
                      </el-dropdown-item>
                      <el-dropdown-item divided @click="handleLogout">
                        <el-icon><SwitchButton /></el-icon>
                        退出登录
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
              <el-button v-else type="primary" @click="handleLogin">
                登录
              </el-button>
            </div>
          </div>
        </div>
      </el-header>
      
      <el-main>
        <div class="container">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </el-main>
      
      <el-footer height="80px" class="footer">
        <div class="container">
          <div class="footer-content">
            <p class="text-center">© {{ currentYear }} 旅游景点推荐系统. All rights reserved.</p>
            <div class="footer-links text-center">
              <el-link href="#" :underline="false" class="mx-2">关于我们</el-link>
              <el-divider direction="vertical" />
              <el-link href="#" :underline="false" class="mx-2">使用条款</el-link>
              <el-divider direction="vertical" />
              <el-link href="#" :underline="false" class="mx-2">隐私政策</el-link>
            </div>
          </div>
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from './store/user'
import { Location, User, SwitchButton } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const isLoggedIn = computed(() => userStore.isAuthenticated)
const currentYear = new Date().getFullYear()

// 用户头像和初始字母
const userAvatar = ref('')
const userInitials = computed(() => {
  return userStore.user?.username ? userStore.user.username.charAt(0).toUpperCase() : 'U'
})

onMounted(() => {
  checkLoginStatus()
})

const checkLoginStatus = async () => {
  const token = localStorage.getItem('token')
  if (token) {
    userStore.token = token
    try {
      await userStore.fetchUserProfile()
      userAvatar.value = userStore.user?.avatar || ''
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 如果获取用户信息失败，可能是token无效或过期
      if (error.response?.status === 401 || error.response?.status === 404) {
        userStore.logout() // 清除无效的token
      }
    }
  }
}

const handleLogin = () => {
  router.push('/login')
}

const handleLogout = async () => {
  await userStore.logout()
  router.push('/login')
}

const goToProfile = () => {
  router.push('/profile')
}
</script>

<style lang="less" scoped>
@import './styles/variables.less';

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: @bg-color;
  box-shadow: @box-shadow-base;
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 0;
}

.nav {
  height: 64px;
}

.logo {
  font-size: @font-size-lg;
  font-weight: bold;
  color: @primary-color;
  text-decoration: none;
  display: flex;
  align-items: center;
}

:deep(.el-menu--horizontal) {
  border-bottom: none;
  
  .el-menu-item {
    height: 64px;
    line-height: 64px;
    
    &.is-active {
      color: @primary-color;
      border-bottom-color: @primary-color;
    }
  }
}

.el-main {
  padding-top: @spacing-lg;
  padding-bottom: @spacing-lg;
  background-color: #f5f7fa;
  flex: 1;
}

.footer {
  background-color: @bg-color;
  padding: @spacing-lg 0;
  border-top: 1px solid @border-color;
  
  .footer-content {
    display: flex;
    flex-direction: column;
    gap: @spacing-sm;
  }
  
  p {
    color: @text-color-secondary;
    margin: 0;
  }
}

/* 页面过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式调整 */
@media (max-width: @screen-md) {
  .logo {
    font-size: 16px;
  }
}
</style>