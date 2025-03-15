<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h2>{{ isLogin ? '登录' : '注册' }}</h2>
        <p>{{ isLogin ? '欢迎回来！' : '创建新账号' }}</p>
      </div>

      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">邮箱</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            placeholder="请输入邮箱"
          />
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <div class="password-input">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="请输入密码"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'el-icon-view' : 'el-icon-hide'"></i>
            </button>
          </div>
        </div>

        <div v-if="!isLogin" class="form-group">
          <label for="confirmPassword">确认密码</label>
          <div class="password-input">
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              placeholder="请再次输入密码"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <i :class="showConfirmPassword ? 'el-icon-view' : 'el-icon-hide'"></i>
            </button>
          </div>
        </div>

        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="form.rememberMe" />
            <span>记住我</span>
          </label>
          <a href="#" class="forgot-password">忘记密码？</a>
        </div>

        <button type="submit" class="btn btn-primary btn-block">
          {{ isLogin ? '登录' : '注册' }}
        </button>

        <div class="divider">
          <span>或</span>
        </div>

        <div class="social-login">
          <button type="button" class="btn btn-outline social-btn">
            <i class="el-icon-wechat"></i>
            微信登录
          </button>
          <button type="button" class="btn btn-outline social-btn">
            <i class="el-icon-qq"></i>
            QQ登录
          </button>
        </div>
      </form>

      <div class="login-footer">
        <p>
          {{ isLogin ? '还没有账号？' : '已有账号？' }}
          <a href="#" @click.prevent="toggleMode">
            {{ isLogin ? '立即注册' : '立即登录' }}
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const isLogin = ref(true)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  rememberMe: false
})

const toggleMode = () => {
  isLogin.value = !isLogin.value
  form.email = ''
  form.password = ''
  form.confirmPassword = ''
  form.rememberMe = false
}

const handleSubmit = async () => {
  try {
    if (!isLogin.value && form.password !== form.confirmPassword) {
      ElMessage.error('两次输入的密码不一致')
      return
    }

    // TODO: 实现登录/注册逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success(isLogin.value ? '登录成功' : '注册成功')
    router.push('/')
  } catch (error) {
    ElMessage.error(error.message || '操作失败，请重试')
  }
}
</script>

<style lang="less" scoped>
@import '../styles/variables.less';

.login-page {
  min-height: 100vh;
  .flex-center();
  background: linear-gradient(135deg, fade(@primary-color, 10%) 0%, fade(@primary-color-light, 10%) 100%);
  padding: @spacing-lg;
}

.login-container {
  width: 100%;
  max-width: 480px;
  background: @bg-color;
  border-radius: @border-radius-lg;
  box-shadow: @box-shadow-lg;
  padding: @spacing-xl;
}

.login-header {
  text-align: center;
  margin-bottom: @spacing-xl;

  h2 {
    font-size: @font-size-xxl;
    color: @text-color;
    margin-bottom: @spacing-xs;
  }

  p {
    color: @text-color-secondary;
  }
}

.login-form {
  .form-group {
    margin-bottom: @spacing-lg;

    label {
      display: block;
      margin-bottom: @spacing-xs;
      color: @text-color;
      font-weight: 500;
    }

    input {
      width: 100%;
      height: 44px;
      padding: 0 @spacing-md;
      border: 1px solid @border-color;
      border-radius: @border-radius;
      .hover-transition();

      &:focus {
        border-color: @primary-color;
        box-shadow: 0 0 0 3px fade(@primary-color, 10%);
      }
    }
  }

  .password-input {
    position: relative;

    .toggle-password {
      position: absolute;
      right: @spacing-md;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: @text-color-secondary;
      cursor: pointer;
      padding: 0;

      &:hover {
        color: @text-color;
      }
    }
  }
}

.form-options {
  .flex-between();
  margin-bottom: @spacing-lg;

  .remember-me {
    .flex-center();
    gap: @spacing-xs;
    cursor: pointer;

    input[type="checkbox"] {
      width: 16px;
      height: 16px;
    }
  }

  .forgot-password {
    color: @primary-color;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.btn-block {
  width: 100%;
  height: 44px;
  font-size: @font-size-lg;
}

.divider {
  position: relative;
  text-align: center;
  margin: @spacing-lg 0;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: calc(50% - 30px);
    height: 1px;
    background: @border-color;
  }

  &::before {
    left: 0;
  }

  &::after {
    right: 0;
  }

  span {
    background: @bg-color;
    padding: 0 @spacing-md;
    color: @text-color-secondary;
  }
}

.social-login {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: @spacing-md;

  .social-btn {
    .flex-center();
    gap: @spacing-xs;
    height: 44px;
  }
}

.login-footer {
  margin-top: @spacing-xl;
  text-align: center;
  color: @text-color-secondary;

  a {
    color: @primary-color;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>