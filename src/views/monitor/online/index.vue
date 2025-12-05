<template>
  <div class="online-user-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>在线用户 ({{ filteredTableData.length }}/{{ tableData.length }})</span>
          <div>
            <el-switch
              v-model="autoRefresh"
              active-text="自动刷新"
              inactive-text="手动刷新"
              style="margin-right: 10px"
            />
            <el-button type="primary" :icon="Refresh" @click="fetchOnlineUsers">刷新</el-button>
          </div>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="用户名">
          <el-input 
            v-model="searchForm.username" 
            placeholder="请输入用户名" 
            clearable 
            @clear="handleSearch" 
            style="width: 180px" 
          />
        </el-form-item>
        <el-form-item label="登录IP">
          <el-input 
            v-model="searchForm.loginIp" 
            placeholder="请输入登录IP" 
            clearable 
            @clear="handleSearch" 
            style="width: 180px" 
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-table
        :data="filteredTableData"
        v-loading="loading"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickName" label="昵称" width="120" />
        <el-table-column prop="loginIp" label="登录IP" width="140" />
        <el-table-column prop="loginLocation" label="登录地点" width="150" show-overflow-tooltip />
        <el-table-column prop="browser" label="浏览器" width="150" show-overflow-tooltip />
        <el-table-column prop="os" label="操作系统" width="150" show-overflow-tooltip />
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
              :disabled="!hasPermission('monitor:online:remove')"
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
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { Refresh, Delete, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOnlineUsers, forceLogout } from '@/api/monitor'
import { useMenuStore } from '@/stores/menu'

const menuStore = useMenuStore()

// 权限检查
const hasPermission = (perm) => {
  return menuStore.hasPermission(perm)
}

const loading = ref(false)
const tableData = ref([])
const autoRefresh = ref(false)
let refreshTimer = null

// 搜索表单
const searchForm = reactive({
  username: '',
  loginIp: ''
})

// 过滤后的表格数据
const filteredTableData = computed(() => {
  let result = tableData.value
  
  if (searchForm.username) {
    result = result.filter(item => 
      item.username?.toLowerCase().includes(searchForm.username.toLowerCase()) ||
      item.nickName?.toLowerCase().includes(searchForm.username.toLowerCase())
    )
  }
  
  if (searchForm.loginIp) {
    result = result.filter(item => 
      item.loginIp?.includes(searchForm.loginIp)
    )
  }
  
  return result
})

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

// 搜索
const handleSearch = () => {
  // 搜索逻辑已通过 computed 实现
}

// 重置
const handleReset = () => {
  searchForm.username = ''
  searchForm.loginIp = ''
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

// 监听自动刷新开关
watch(autoRefresh, (newVal) => {
  if (newVal) {
    // 开启自动刷新，每30秒刷新一次
    refreshTimer = setInterval(() => {
      fetchOnlineUsers()
    }, 30000)
  } else {
    // 关闭自动刷新
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }
})

onMounted(() => {
  fetchOnlineUsers()
})

onUnmounted(() => {
  // 组件卸载时清除定时器
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
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

.search-form {
  margin-bottom: 20px;
}
</style>

