<template>
  <div class="online-user-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>在线用户 ({{ tableData.length }})</span>
          <el-button type="primary" :icon="Refresh" @click="fetchOnlineUsers">刷新</el-button>
        </div>
      </template>
      
      <el-table
        :data="tableData"
        v-loading="loading"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickName" label="昵称" width="120" />
        <el-table-column prop="loginIp" label="登录IP" width="140" />
        <el-table-column prop="loginLocation" label="登录地点" width="150" />
        <el-table-column prop="browser" label="浏览器" width="150" />
        <el-table-column prop="os" label="操作系统" width="150" />
        <el-table-column prop="loginTime" label="登录时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.loginTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button
              type="danger"
              link
              :icon="Delete"
              @click="handleForceLogout(scope.row)"
            >
              强制下线
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Refresh, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOnlineUsers, forceLogout } from '@/api/monitor'

const loading = ref(false)
const tableData = ref([])

// 获取在线用户列表
const fetchOnlineUsers = async () => {
  loading.value = true
  try {
    const res = await getOnlineUsers()
    if (res.code === '200' && res.data) {
      tableData.value = res.data || []
    } else {
      ElMessage.error(res.message || '获取在线用户列表失败')
    }
  } catch (error) {
    console.error('获取在线用户列表失败:', error)
    ElMessage.error('获取在线用户列表失败')
  } finally {
    loading.value = false
  }
}

// 强制下线
const handleForceLogout = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要强制下线用户 "${row.username}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const res = await forceLogout(row.token)
    if (res.code === '200') {
      ElMessage.success('强制下线成功')
      fetchOnlineUsers()
    } else {
      ElMessage.error(res.message || '强制下线失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('强制下线失败:', error)
      ElMessage.error('强制下线失败')
    }
  }
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  if (typeof dateTime === 'string') {
    return dateTime.replace('T', ' ').substring(0, 19)
  }
  return new Date(dateTime).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchOnlineUsers()
})
</script>

<style scoped>
.online-user-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

