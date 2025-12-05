<template>
  <div class="server-monitor-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>服务器信息</span>
          <el-button type="primary" :icon="Refresh" @click="fetchServerInfo">刷新</el-button>
        </div>
      </template>
      
      <el-row :gutter="20" v-loading="loading">
        <el-col :span="12">
          <el-descriptions title="基本信息" :column="1" border>
            <el-descriptions-item label="服务器名称">
              {{ serverInfo.serverName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="服务器IP">
              {{ serverInfo.serverIp || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="操作系统">
              {{ serverInfo.osName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="系统架构">
              {{ serverInfo.osArch || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="系统版本">
              {{ serverInfo.osVersion || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="CPU核心数">
              {{ serverInfo.cpuCount || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-col>
        
        <el-col :span="12">
          <el-descriptions title="资源使用情况" :column="1" border>
            <el-descriptions-item label="CPU使用率">
              <el-progress
                :percentage="serverInfo.cpuUsage || 0"
                :color="getUsageColor(serverInfo.cpuUsage)"
                :format="(percentage) => `${percentage}%`"
              />
            </el-descriptions-item>
            <el-descriptions-item label="内存使用率">
              <el-progress
                :percentage="serverInfo.memoryUsage || 0"
                :color="getUsageColor(serverInfo.memoryUsage)"
                :format="(percentage) => `${percentage}%`"
              />
              <div class="memory-detail">
                <span>已用: {{ formatMemory(serverInfo.usedMemory) }}</span>
                <span>可用: {{ formatMemory(serverInfo.freeMemory) }}</span>
                <span>总计: {{ formatMemory(serverInfo.totalMemory) }}</span>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="磁盘使用率">
              <el-progress
                :percentage="serverInfo.diskUsage || 0"
                :color="getUsageColor(serverInfo.diskUsage)"
                :format="(percentage) => `${percentage}%`"
              />
              <div class="disk-detail">
                <span>已用: {{ formatDisk(serverInfo.usedDisk) }}</span>
                <span>可用: {{ formatDisk(serverInfo.freeDisk) }}</span>
                <span>总计: {{ formatDisk(serverInfo.totalDisk) }}</span>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getServerInfo as getServerInfoApi } from '@/api/monitor'

const loading = ref(false)
const serverInfo = ref({})

// 获取服务器信息
const fetchServerInfo = async () => {
  loading.value = true
  try {
    const res = await getServerInfoApi()
    if (res.code === '200' && res.data) {
      serverInfo.value = res.data
    } else {
      ElMessage.error(res.message || '获取服务器信息失败')
    }
  } catch (error) {
    console.error('获取服务器信息失败:', error)
    ElMessage.error('获取服务器信息失败')
  } finally {
    loading.value = false
  }
}

// 格式化内存大小
const formatMemory = (mb) => {
  if (!mb) return '-'
  if (mb < 1024) {
    return `${mb} MB`
  }
  return `${(mb / 1024).toFixed(2)} GB`
}

// 格式化磁盘大小
const formatDisk = (gb) => {
  if (!gb) return '-'
  return `${gb} GB`
}

// 根据使用率获取颜色
const getUsageColor = (usage) => {
  if (!usage) return '#909399'
  if (usage < 50) return '#67c23a'
  if (usage < 80) return '#e6a23c'
  return '#f56c6c'
}

onMounted(() => {
  fetchServerInfo()
})
</script>

<style scoped>
.server-monitor-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.memory-detail,
.disk-detail {
  display: flex;
  gap: 20px;
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}
</style>

