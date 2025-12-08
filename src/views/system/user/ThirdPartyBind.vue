<template>
  <div class="third-party-bind-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>第三方账号绑定</span>
        </div>
      </template>

      <el-descriptions :column="1" border>
        <el-descriptions-item label="微信">
          <div class="bind-item">
            <span v-if="bindStatus.wechat" class="bind-status bound">
              <el-icon><Check /></el-icon>
              已绑定
            </span>
            <span v-else class="bind-status unbound">
              <el-icon><Close /></el-icon>
              未绑定
            </span>
            <el-button
              v-if="bindStatus.wechat"
              type="danger"
              size="small"
              @click="handleUnbind('WECHAT')"
              :loading="unbinding === 'WECHAT'"
            >
              解绑
            </el-button>
            <el-button
              v-else
              type="primary"
              size="small"
              @click="handleBind('WECHAT')"
              :loading="binding === 'WECHAT'"
            >
              绑定
            </el-button>
          </div>
        </el-descriptions-item>

        <el-descriptions-item label="QQ">
          <div class="bind-item">
            <span v-if="bindStatus.qq" class="bind-status bound">
              <el-icon><Check /></el-icon>
              已绑定
            </span>
            <span v-else class="bind-status unbound">
              <el-icon><Close /></el-icon>
              未绑定
            </span>
            <el-button
              v-if="bindStatus.qq"
              type="danger"
              size="small"
              @click="handleUnbind('QQ')"
              :loading="unbinding === 'QQ'"
            >
              解绑
            </el-button>
            <el-button
              v-else
              type="primary"
              size="small"
              @click="handleBind('QQ')"
              :loading="binding === 'QQ'"
            >
              绑定
            </el-button>
          </div>
        </el-descriptions-item>
      </el-descriptions>

      <el-alert
        type="info"
        :closable="false"
        style="margin-top: 20px"
      >
        <template #title>
          <div>
            <p>绑定第三方账号后，可以使用第三方账号快速登录</p>
            <p style="margin-top: 8px; font-size: 12px; color: #909399;">
              注意：绑定操作需要跳转到第三方平台进行授权，请确保已登录系统
            </p>
          </div>
        </template>
      </el-alert>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Close } from '@element-plus/icons-vue'
import { getThirdPartyBindStatus, getThirdPartyAuthUrl, unbindThirdParty } from '@/api/auth'

const bindStatus = ref({
  wechat: false,
  qq: false
})

const binding = ref('')
const unbinding = ref('')

onMounted(() => {
  loadBindStatus()
})

const loadBindStatus = async () => {
  try {
    const res = await getThirdPartyBindStatus()
    if (res.code === '200' && res.data) {
      bindStatus.value = res.data
    }
  } catch (error) {
    console.error('获取绑定状态失败:', error)
  }
}

const handleBind = async (type) => {
  try {
    binding.value = type
    const res = await getThirdPartyAuthUrl(type)
    if (res.code === '200' && res.data?.authUrl) {
      // 保存state到sessionStorage
      if (res.data.state) {
        sessionStorage.setItem(`third_party_state_${type.toLowerCase()}`, res.data.state)
        sessionStorage.setItem('third_party_bind_type', type)
      }
      // 跳转到第三方授权页面
      window.location.href = res.data.authUrl
    } else {
      ElMessage.error('获取授权地址失败')
    }
  } catch (error) {
    console.error('绑定失败:', error)
    ElMessage.error('获取授权地址失败，请重试')
  } finally {
    binding.value = ''
  }
}

const handleUnbind = async (type) => {
  try {
    await ElMessageBox.confirm(
      `确定要解绑${type === 'WECHAT' ? '微信' : 'QQ'}账号吗？解绑后将无法使用该账号登录。`,
      '确认解绑',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    unbinding.value = type
    const res = await unbindThirdParty(type)
    if (res.code === '200' && res.data) {
      ElMessage.success('解绑成功')
      await loadBindStatus()
    } else {
      ElMessage.error(res.message || '解绑失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('解绑失败:', error)
      ElMessage.error(error.message || '解绑失败，请重试')
    }
  } finally {
    unbinding.value = ''
  }
}
</script>

<style scoped>
.third-party-bind-container {
  padding: 20px;
}

.card-header {
  font-size: 18px;
  font-weight: 600;
}

.bind-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bind-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.bind-status.bound {
  color: #67c23a;
}

.bind-status.unbound {
  color: #909399;
}
</style>

