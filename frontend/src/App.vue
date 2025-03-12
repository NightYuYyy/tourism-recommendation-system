<template>
  <div class="app">
    <header class="header">
      <nav class="nav container">
        <div class="nav-left">
          <router-link to="/" class="logo">
            旅游推荐
          </router-link>
          <div class="nav-links">
            <router-link to="/attractions">景点</router-link>
            <router-link to="/recommendations">推荐</router-link>
          </div>
        </div>
        
        <div class="nav-right">
          <template v-if="isLoggedIn">
            <router-link to="/user">个人中心</router-link>
            <button class="btn btn-secondary" @click="handleLogout">
              退出
            </button>
          </template>
          <button v-else class="btn btn-primary" @click="handleLogin">
            登录
          </button>
        </div>
      </nav>
    </header>
    
    <main class="main container">
      <router-view></router-view>
    </main>
    
    <footer class="footer">
      <div class="container">
        <p class="text-center">© 2024 旅游景点推荐系统. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from './store/user'

const router = useRouter()
const userStore = useUserStore()
const isLoggedIn = ref(false)

onMounted(() => {
  checkLoginStatus()
})

const checkLoginStatus = () => {
  const token = localStorage.getItem('token')
  isLoggedIn.value = !!token
}

const handleLogin = () => {
  router.push('/login')
}

const handleLogout = async () => {
  await userStore.logout()
  router.push('/login')
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
}

.nav {
  height: 64px;
  .flex-between();

  &-left {
    .flex-center();
    gap: @spacing-xl;
  }

  &-right {
    .flex-center();
    gap: @spacing-md;
  }

  &-links {
    .flex-center();
    gap: @spacing-lg;
    
    @media (max-width: @screen-md) {
      display: none;
    }

    a {
      color: @text-color-secondary;
      text-decoration: none;
      .hover-transition();

      &:hover, &.router-link-active {
        color: @primary-color;
      }
    }
  }
}

.logo {
  font-size: @font-size-lg;
  font-weight: bold;
  color: @primary-color;
  text-decoration: none;
}

.main {
  flex: 1;
  padding: @spacing-lg 0;
}

.footer {
  background-color: @bg-color;
  padding: @spacing-lg 0;
  margin-top: auto;
  
  p {
    color: @text-color-secondary;
  }
}
</style>