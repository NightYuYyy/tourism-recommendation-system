<template>
  <div class="login-page">
    <el-card class="login-container">
      <div class="login-header">
        <h2>{{ isLogin ? '登录' : '注册' }}</h2>
        <p>{{ isLogin ? '欢迎回来！' : '创建新账号' }}</p>
      </div>

      <el-form 
        ref="formRef"
        :model="form"
        :rules="rules"
        class="login-form"
        @submit.prevent="handleSubmit"
      >
        <el-form-item 
          v-if="!isLogin" 
          prop="username" 
          label="用户名"
        >
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="email" label="邮箱">
          <el-input
            v-model="form.email"
            type="email"
            placeholder="请输入邮箱"
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password" label="密码">
          <el-input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入密码"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
            <template #suffix>
              <el-icon 
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              >
                <View v-if="showPassword" />
                <Hide v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item 
          v-if="!isLogin" 
          prop="confirmPassword" 
          label="确认密码"
        >
          <el-input
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="请再次输入密码"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
            <template #suffix>
              <el-icon 
                class="cursor-pointer"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <View v-if="showConfirmPassword" />
                <Hide v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <div class="form-options">
          <el-checkbox v-model="form.rememberMe">记住我</el-checkbox>
          <el-link type="primary" href="#">忘记密码？</el-link>
        </div>

        <el-button 
          type="primary" 
          class="w-full"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ isLogin ? '登录' : '注册' }}
        </el-button>


      </el-form>

      <div class="login-footer">
        <p>
          {{ isLogin ? '还没有账号？' : '已有账号？' }}
          <el-link 
            type="primary"
            @click="toggleMode"
          >
            {{ isLogin ? '立即注册' : '立即登录' }}
          </el-link>
        </p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Message, Lock, View, Hide, User } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { useUserStore } from '@/store/user'

const router = useRouter()
const formRef = ref(null)
const isLogin = ref(true)
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  rememberMe: false
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度不能小于3位', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { 
      required: true, 
      message: '请再次输入密码', 
      trigger: 'blur' 
    },
    {
      validator: (rule, value, callback) => {
        if (value !== form.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const toggleMode = () => {
  isLogin.value = !isLogin.value
  form.username = ''
  form.email = ''
  form.password = ''
  form.confirmPassword = ''
  form.rememberMe = false
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    const url = isLogin.value ? '/auth/login' : '/auth/register'
    const requestData = isLogin.value 
      ? {
          email: form.email,
          password: form.password,
          remember: form.rememberMe
        }
      : {
          username: form.username,
          email: form.email,
          password: form.password
        }
    
    const data = await request.post(url, requestData)
    
    // 使用Pinia存储用户信息和token
    const userStore = useUserStore()
    userStore.token = data.token
    userStore.user = data.user
    localStorage.setItem('token', data.token)
    
    ElMessage.success(isLogin.value ? '登录成功' : '注册成功')
    router.push('/')
  } catch (error) {
    console.error('操作失败:', error)
    let errorMsg = '操作失败，请重试'
    
    if (error.response && error.response.data) {
      errorMsg = error.response.data.message || errorMsg
    } else if (error.message) {
      errorMsg = error.message
    }
    
    ElMessage.error(errorMsg)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="less" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-bg-color-page);
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 480px;
}

.login-header {
  text-align: center;
  margin-bottom: 24px;

  h2 {
    font-size: 24px;
    margin-bottom: 8px;
  }

  p {
    color: var(--el-text-color-secondary);
  }
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0;
}

.social-login {
  margin-top: 16px;
}

.login-footer {
  text-align: center;
  margin-top: 24px;
}

:deep(.el-input-group__prepend) {
  padding: 0 12px;
}
</style>