<template>
  <div class="callback-container">
    <div class="callback-box">
      <el-result
        v-if="status === 'loading'"
        icon="info"
        title="正在处理第三方登录..."
        sub-title="请稍候"
      >
        <template #extra>
          <el-icon class="is-loading"><Loading /></el-icon>
        </template>
      </el-result>

      <el-result
        v-else-if="status === 'success'"
        icon="success"
        title="登录成功"
        sub-title="正在跳转..."
      />

      <el-result
        v-else-if="status === 'bind'"
        icon="warning"
        title="账号未绑定"
        sub-title="该第三方账号尚未绑定，请先绑定账号"
      >
        <template #extra>
          <el-button type="primary" @click="handleBind">立即绑定</el-button>
          <el-button @click="goToLogin">返回登录</el-button>
        </template>
      </el-result>

      <el-result
        v-else
        icon="error"
        title="登录失败"
        :sub-title="errorMessage || '第三方登录失败，请重试'"
      >
        <template #extra>
          <el-button type="primary" @click="goToLogin">返回登录</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getThirdPartyUserInfo, bindThirdParty } from '@/api/auth'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const status = ref('loading') // loading, success, bind, error
const errorMessage = ref('')
const thirdPartyInfo = ref(null)

onMounted(async () => {
  await handleCallback()
})

const handleCallback = async () => {
  try {
    const { type, code, state } = route.query

    if (!type || !code) {
      status.value = 'error'
      errorMessage.value = '缺少必要参数'
      return
    }

    // 验证state（防CSRF）
    const savedState = sessionStorage.getItem(`third_party_state_${type.toLowerCase()}`)
    if (state && savedState && state !== savedState) {
      status.value = 'error'
      errorMessage.value = '状态参数验证失败'
      return
    }

    // 获取第三方用户信息
    const res = await getThirdPartyUserInfo(type, code, state)
    if (res.code !== '200' || !res.data) {
      status.value = 'error'
      errorMessage.value = res.message || '获取用户信息失败'
      return
    }

    thirdPartyInfo.value = res.data

    // 如果已绑定，提示用户使用账号密码登录
    // 注意：如果需要支持第三方账号直接登录，需要后端提供相应的登录接口
    if (res.data.bound && res.data.adminId) {
      ElMessage.info('该第三方账号已绑定，请使用账号密码登录')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
      return
    }

    // 如果未绑定，提示绑定
    status.value = 'bind'
  } catch (error) {
    console.error('第三方登录回调处理失败:', error)
    status.value = 'error'
    errorMessage.value = error.message || '处理失败，请重试'
  }
}

const handleBind = async () => {
  // 检查是否是从绑定页面跳转过来的
  const bindType = sessionStorage.getItem('third_party_bind_type')
  
  if (bindType && userStore.isLoggedIn) {
    // 从绑定页面跳转过来的，直接绑定
    try {
      if (!thirdPartyInfo.value) {
        ElMessage.error('第三方信息获取失败')
        return
      }

      const res = await bindThirdParty({
        type: thirdPartyInfo.value.type,
        code: route.query.code,
        openId: thirdPartyInfo.value.openId,
        unionId: thirdPartyInfo.value.unionId,
        state: route.query.state
      })

      if (res.code === '200' && res.data) {
        ElMessage.success('绑定成功')
        sessionStorage.removeItem('third_party_bind_type')
        status.value = 'success'
        setTimeout(() => {
          router.push('/system/user/third-party-bind')
        }, 1500)
      } else {
        ElMessage.error(res.message || '绑定失败')
      }
    } catch (error) {
      console.error('绑定失败:', error)
      ElMessage.error(error.message || '绑定失败，请重试')
    }
  } else {
    // 未登录，跳转到登录页
    ElMessage.warning('请先登录后再绑定第三方账号')
    // 保存第三方信息到sessionStorage，登录后可以继续绑定
    if (thirdPartyInfo.value) {
      sessionStorage.setItem('pending_third_party_bind', JSON.stringify({
        type: thirdPartyInfo.value.type,
        code: route.query.code,
        openId: thirdPartyInfo.value.openId,
        unionId: thirdPartyInfo.value.unionId,
        state: route.query.state
      }))
    }
    router.push('/login')
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.callback-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.callback-box {
  width: 500px;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>


