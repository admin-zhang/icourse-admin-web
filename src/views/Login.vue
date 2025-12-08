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
            <el-form-item prop="agreed">
              <el-checkbox v-model="passwordForm.agreed" size="large">
                我已阅读并同意
                <el-link type="primary" :underline="false" @click.stop.prevent="showAgreement('user')">《用户协议》</el-link>
                和
                <el-link type="primary" :underline="false" @click.stop.prevent="showAgreement('privacy')">《隐私政策》</el-link>
              </el-checkbox>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="login-button"
                :loading="loading"
                :disabled="!passwordForm.agreed"
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
            <el-form-item prop="agreed">
              <el-checkbox v-model="smsForm.agreed" size="large">
                我已阅读并同意
                <el-link type="primary" :underline="false" @click.stop.prevent="showAgreement('user')">《用户协议》</el-link>
                和
                <el-link type="primary" :underline="false" @click.stop.prevent="showAgreement('privacy')">《隐私政策》</el-link>
              </el-checkbox>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="login-button"
                :loading="loading"
                :disabled="!smsForm.agreed"
                @click="handleSmsLogin"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <!-- 第三方登录 -->
      <div class="third-party-login">
        <div class="third-party-divider">
          <span class="divider-text">或</span>
        </div>
        <div class="third-party-buttons">
          <el-button
            class="third-party-btn wechat-btn"
            @click="handleWechatLogin"
            :loading="thirdPartyLoading"
          >
            <svg class="third-party-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.598-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18 0 .653-.52 1.18-1.162 1.18-.642 0-1.162-.527-1.162-1.18 0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18 0 .653-.52 1.18-1.162 1.18-.642 0-1.162-.527-1.162-1.18 0-.651.52-1.18 1.162-1.18zm-2.968 4.68c-1.285 0-2.498.494-3.415 1.392a.744.744 0 0 0 0 1.052.68.68 0 0 0 .962 0 3.303 3.303 0 0 1 2.453-1.08c.276 0 .543.04.811.08-.157-.494-.157-1.02 0-1.514a.68.68 0 0 0-.811-.93zm2.968.295c-.642 0-1.162.528-1.162 1.18 0 .652.52 1.18 1.162 1.18.642 0 1.162-.528 1.162-1.18 0-.652-.52-1.18-1.162-1.18zm2.784.295c-.642 0-1.162.528-1.162 1.18 0 .652.52 1.18 1.162 1.18.642 0 1.162-.528 1.162-1.18 0-.652-.52-1.18-1.162-1.18z"/>
            </svg>
            微信登录
          </el-button>
          <el-button
            class="third-party-btn qq-btn"
            @click="handleQQLogin"
            :loading="thirdPartyLoading"
          >
            <svg class="third-party-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
            </svg>
            QQ登录
          </el-button>
        </div>
      </div>
    </div>

    <!-- 协议弹窗 -->
    <el-dialog
      v-model="agreementDialogVisible"
      :title="agreementTitle"
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="agreement-content" v-html="agreementContent"></div>
      <template #footer>
        <el-button @click="agreementDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Phone, Message } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { sendSmsCode, getThirdPartyAuthUrl } from '@/api/auth'
import { logoConfig } from '@/config/logo'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeTab = ref('password')
const loading = ref(false)
const codeCountdown = ref(0)
const thirdPartyLoading = ref(false)

// Logo配置
const logoUrl = ref(logoConfig.url)
const logoAlt = ref(logoConfig.alt)

const passwordFormRef = ref(null)
const smsFormRef = ref(null)

const passwordForm = reactive({
  username: '',
  password: '',
  agreed: false
})

const smsForm = reactive({
  phone: '',
  code: '',
  agreed: false
})

// 协议弹窗
const agreementDialogVisible = ref(false)
const agreementType = ref('user') // 'user' 或 'privacy'
const agreementTitle = ref('')
const agreementContent = ref('')

// 验证规则
const passwordRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  agreed: [
    { 
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请先阅读并同意用户协议和隐私政策'))
        } else {
          callback()
        }
      }, 
      trigger: 'change' 
    }
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
  ],
  agreed: [
    { 
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请先阅读并同意用户协议和隐私政策'))
        } else {
          callback()
        }
      }, 
      trigger: 'change' 
    }
  ]
}

// 显示协议内容
const showAgreement = (type) => {
  // 阻止事件冒泡，防止触发复选框的点击事件
  agreementType.value = type
  if (type === 'user') {
    agreementTitle.value = '用户协议'
    agreementContent.value = getUserAgreementContent()
  } else if (type === 'privacy') {
    agreementTitle.value = '隐私政策'
    agreementContent.value = getPrivacyPolicyContent()
  }
  agreementDialogVisible.value = true
}

// 用户协议内容
const getUserAgreementContent = () => {
  return `
    <h3>一、服务条款的确认和接纳</h3>
    <p>欢迎使用iCourse管理后台服务。在使用本服务前，请您仔细阅读本用户协议（以下简称"本协议"）。</p>
    <p>当您点击"同意"按钮或使用本服务时，即表示您已充分理解并同意接受本协议的全部内容。</p>
    
    <h3>二、服务说明</h3>
    <p>iCourse管理后台（以下简称"本平台"）是一个在线教育管理平台，为用户提供课程管理、用户管理、订单管理等功能。</p>
    
    <h3>三、用户账户</h3>
    <p>1. 您需要注册账户才能使用本平台的部分功能。</p>
    <p>2. 您应当妥善保管账户信息，对账户下的所有行为负责。</p>
    <p>3. 如发现账户被盗用或存在安全风险，请立即通知我们。</p>
    
    <h3>四、使用规范</h3>
    <p>您在使用本平台时，应当遵守相关法律法规，不得从事以下行为：</p>
    <p>1. 发布违法、违规、侵权信息；</p>
    <p>2. 干扰、破坏本平台的正常运行；</p>
    <p>3. 未经授权访问、使用他人账户；</p>
    <p>4. 其他违反法律法规或本协议的行为。</p>
    
    <h3>五、知识产权</h3>
    <p>本平台的所有内容，包括但不限于文字、图片、软件、程序、版面设计等，均受知识产权法保护。</p>
    
    <h3>六、免责声明</h3>
    <p>本平台不对因使用或无法使用本服务而产生的任何直接、间接、偶然、特殊或后果性损害承担责任。</p>
    
    <h3>七、协议修改</h3>
    <p>我们有权随时修改本协议。修改后的协议将在本平台公布，自公布之日起生效。</p>
    
    <h3>八、联系我们</h3>
    <p>如您对本协议有任何疑问，请联系我们。</p>
  `
}

// 隐私政策内容
const getPrivacyPolicyContent = () => {
  return `
    <h3>一、信息收集</h3>
    <p>我们可能收集以下信息：</p>
    <p>1. 账户信息：用户名、密码、手机号等；</p>
    <p>2. 使用信息：登录记录、操作日志等；</p>
    <p>3. 设备信息：IP地址、浏览器类型、操作系统等。</p>
    
    <h3>二、信息使用</h3>
    <p>我们使用收集的信息用于：</p>
    <p>1. 提供、维护和改进服务；</p>
    <p>2. 处理您的请求和交易；</p>
    <p>3. 发送重要通知；</p>
    <p>4. 进行数据分析，优化用户体验。</p>
    
    <h3>三、信息保护</h3>
    <p>我们采用行业标准的安全措施保护您的个人信息，包括：</p>
    <p>1. 数据加密传输；</p>
    <p>2. 访问权限控制；</p>
    <p>3. 定期安全审计；</p>
    <p>4. 安全事件响应机制。</p>
    
    <h3>四、信息共享</h3>
    <p>我们不会向第三方出售、交易或转让您的个人信息，除非：</p>
    <p>1. 获得您的明确同意；</p>
    <p>2. 法律法规要求；</p>
    <p>3. 保护我们的权利和财产。</p>
    
    <h3>五、Cookie使用</h3>
    <p>我们使用Cookie来改善用户体验，您可以通过浏览器设置管理Cookie。</p>
    
    <h3>六、您的权利</h3>
    <p>您有权：</p>
    <p>1. 访问、更正、删除您的个人信息；</p>
    <p>2. 撤回同意；</p>
    <p>3. 投诉举报。</p>
    
    <h3>七、未成年人保护</h3>
    <p>我们非常重视未成年人的个人信息保护。如果您是未成年人，请在监护人指导下使用本服务。</p>
    
    <h3>八、政策更新</h3>
    <p>我们可能随时更新本隐私政策，更新后的政策将在本平台公布。</p>
    
    <h3>九、联系我们</h3>
    <p>如您对本隐私政策有任何疑问，请联系我们。</p>
  `
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
    } else {
      // 如果未同意协议，提示用户
      if (!passwordForm.agreed) {
        ElMessage.warning('请先阅读并同意用户协议和隐私政策')
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
    } else {
      // 如果未同意协议，提示用户
      if (!smsForm.agreed) {
        ElMessage.warning('请先阅读并同意用户协议和隐私政策')
      }
    }
  })
}

// 微信登录
const handleWechatLogin = async () => {
  try {
    thirdPartyLoading.value = true
    const res = await getThirdPartyAuthUrl('WECHAT')
    if (res.code === '200' && res.data?.authUrl) {
      // 保存state到sessionStorage，用于回调时验证
      if (res.data.state) {
        sessionStorage.setItem('third_party_state_wechat', res.data.state)
      }
      // 跳转到微信授权页面
      window.location.href = res.data.authUrl
    } else {
      ElMessage.error('获取微信授权地址失败')
    }
  } catch (error) {
    console.error('微信登录失败:', error)
    ElMessage.error('微信登录失败，请重试')
  } finally {
    thirdPartyLoading.value = false
  }
}

// QQ登录
const handleQQLogin = async () => {
  try {
    thirdPartyLoading.value = true
    const res = await getThirdPartyAuthUrl('QQ')
    if (res.code === '200' && res.data?.authUrl) {
      // 保存state到sessionStorage，用于回调时验证
      if (res.data.state) {
        sessionStorage.setItem('third_party_state_qq', res.data.state)
      }
      // 跳转到QQ授权页面
      window.location.href = res.data.authUrl
    } else {
      ElMessage.error('获取QQ授权地址失败')
    }
  } catch (error) {
    console.error('QQ登录失败:', error)
    ElMessage.error('QQ登录失败，请重试')
  } finally {
    thirdPartyLoading.value = false
  }
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

.third-party-login {
  margin-top: 30px;
}

.third-party-divider {
  position: relative;
  text-align: center;
  margin: 20px 0;
}

.third-party-divider::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1px;
  background: #e0e0e0;
}

.divider-text {
  position: relative;
  background: #fff;
  padding: 0 15px;
  color: #999;
  font-size: 14px;
}

.third-party-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.third-party-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s;
}

.third-party-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.wechat-btn {
  background: #07c160;
  border-color: #07c160;
  color: #fff;
}

.wechat-btn:hover {
  background: #06ad56;
  border-color: #06ad56;
}

.qq-btn {
  background: #12b7f5;
  border-color: #12b7f5;
  color: #fff;
}

.qq-btn:hover {
  background: #0fa5d8;
  border-color: #0fa5d8;
}

.third-party-icon {
  width: 20px;
  height: 20px;
}

.agreement-content {
  max-height: 500px;
  overflow-y: auto;
  line-height: 1.8;
  color: #333;
  padding: 10px;
}

.agreement-content h3 {
  margin-top: 20px;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.agreement-content h3:first-child {
  margin-top: 0;
}

.agreement-content p {
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
}

:deep(.el-checkbox__label) {
  font-size: 14px;
  color: #606266;
}

:deep(.el-link) {
  font-size: 14px;
  margin: 0 2px;
}
</style>

