<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <!-- Logo展示 -->
        <div class="login-logo" v-if="logoUrl">
          <img :src="logoUrl" :alt="logoAlt" class="logo-image" />
        </div>
        <h2>iCourse 管理后台</h2>
        <p>管理员登录</p>
      </div>

      <el-tabs v-model="activeTab" class="login-tabs">
        <el-tab-pane label="账号登录" name="password">
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            class="login-form"
          >
            <el-form-item prop="username">
              <el-input
                v-model="passwordForm.username"
                placeholder="请输入管理员用户名"
                size="large"
                :prefix-icon="User"
                clearable
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="passwordForm.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                :prefix-icon="Lock"
                show-password
                @keyup.enter="handlePasswordLogin"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="login-button"
                :loading="loading"
                @click="handlePasswordLogin"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="短信登录" name="sms">
          <el-form
            ref="smsFormRef"
            :model="smsForm"
            :rules="smsRules"
            class="login-form"
          >
            <el-form-item prop="phone">
              <el-input
                v-model="smsForm.phone"
                placeholder="请输入手机号"
                size="large"
                :prefix-icon="Phone"
                clearable
              />
            </el-form-item>
            <el-form-item prop="code">
              <div class="code-input-group">
                <el-input
                  v-model="smsForm.code"
                  placeholder="请输入验证码"
                  size="large"
                  :prefix-icon="Message"
                  clearable
                  @keyup.enter="handleSmsLogin"
                />
                <el-button
                  :disabled="codeCountdown > 0"
                  @click="handleSendCode"
                >
                  {{ codeCountdown > 0 ? `${codeCountdown}秒后重试` : '获取验证码' }}
                </el-button>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="login-button"
                :loading="loading"
                @click="handleSmsLogin"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Phone, Message } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { sendSmsCode } from '@/api/auth'
import { logoConfig } from '@/config/logo'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeTab = ref('password')
const loading = ref(false)
const codeCountdown = ref(0)

// Logo配置
const logoUrl = ref(logoConfig.url)
const logoAlt = ref(logoConfig.alt)

const passwordFormRef = ref(null)
const smsFormRef = ref(null)

const passwordForm = reactive({
  username: '',
  password: ''
})

const smsForm = reactive({
  phone: '',
  code: ''
})

// 验证规则
const passwordRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const smsRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '验证码为6位数字', trigger: 'blur' }
  ]
}

// 用户名密码登录
const handlePasswordLogin = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await userStore.login({
          username: passwordForm.username,
          password: passwordForm.password
        })
        
        ElMessage.success('登录成功')
        
        // 跳转到之前访问的页面或首页
        const redirect = route.query.redirect || '/'
        router.push(redirect)
      } catch (error) {
        console.error('登录失败:', error)
        const errorMessage = error.message || error.response?.data?.message || '登录失败，请检查用户名和密码'
        ElMessage.error(errorMessage)
      } finally {
        loading.value = false
      }
    }
  })
}

// 发送验证码
const handleSendCode = async () => {
  if (!smsFormRef.value) return
  
  // 只验证手机号
  await smsFormRef.value.validateField('phone', async (valid) => {
    if (valid) {
      try {
        await sendSmsCode({
          phone: smsForm.phone
        })
        
        ElMessage.success('验证码已发送，请查看日志')
        
        // 开始倒计时
        codeCountdown.value = 60
        const timer = setInterval(() => {
          codeCountdown.value--
          if (codeCountdown.value <= 0) {
            clearInterval(timer)
          }
        }, 1000)
      } catch (error) {
        console.error('发送验证码失败:', error)
      }
    }
  })
}

// 短信验证码登录
const handleSmsLogin = async () => {
  if (!smsFormRef.value) return
  
  await smsFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await userStore.loginBySms({
          phone: smsForm.phone,
          code: smsForm.code
        })
        
        ElMessage.success('登录成功')
        
        // 跳转到之前访问的页面或首页
        const redirect = route.query.redirect || '/'
        router.push(redirect)
      } catch (error) {
        console.error('登录失败:', error)
        const errorMessage = error.message || error.response?.data?.message || '登录失败，请检查验证码是否正确'
        ElMessage.error(errorMessage)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 420px;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-logo {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-logo .logo-image {
  max-width: 120px;
  max-height: 60px;
  object-fit: contain;
}

.login-header h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
}

.login-header p {
  font-size: 14px;
  color: #999;
}

.login-tabs {
  margin-top: 20px;
}

.login-form {
  margin-top: 20px;
}

.login-button {
  width: 100%;
  margin-top: 10px;
}

.code-input-group {
  display: flex;
  gap: 10px;
}

.code-input-group :deep(.el-input) {
  flex: 1;
}
</style>

