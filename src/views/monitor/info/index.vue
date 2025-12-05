<template>
  <div class="monitor-info-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>综合监控信息</span>
          <el-button type="primary" :icon="Refresh" @click="fetchMonitorInfo">刷新</el-button>
        </div>
      </template>
      
      <el-row :gutter="20" v-loading="loading">
        <!-- 服务器信息卡片 -->
        <el-col :span="8">
          <el-card shadow="hover">
            <template #header>
              <div class="card-title">
                <el-icon><Monitor /></el-icon>
                <span>服务器信息</span>
              </div>
            </template>
            <div class="info-item">
              <span class="label">服务器名称:</span>
              <span class="value">{{ monitorInfo.serverInfo?.serverName || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">CPU使用率:</span>
              <el-progress
                :percentage="monitorInfo.serverInfo?.cpuUsage || 0"
                :color="getUsageColor(monitorInfo.serverInfo?.cpuUsage)"
                :format="(percentage) => `${percentage}%`"
              />
            </div>
            <div class="info-item">
              <span class="label">内存使用率:</span>
              <el-progress
                :percentage="monitorInfo.serverInfo?.memoryUsage || 0"
                :color="getUsageColor(monitorInfo.serverInfo?.memoryUsage)"
                :format="(percentage) => `${percentage}%`"
              />
            </div>
            <div class="info-item">
              <span class="label">磁盘使用率:</span>
              <el-progress
                :percentage="monitorInfo.serverInfo?.diskUsage || 0"
                :color="getUsageColor(monitorInfo.serverInfo?.diskUsage)"
                :format="(percentage) => `${percentage}%`"
              />
            </div>
          </el-card>
        </el-col>
        
        <!-- JVM信息卡片 -->
        <el-col :span="8">
          <el-card shadow="hover">
            <template #header>
              <div class="card-title">
                <el-icon><Cpu /></el-icon>
                <span>JVM信息</span>
              </div>
            </template>
            <div class="info-item">
              <span class="label">Java版本:</span>
              <span class="value">{{ monitorInfo.jvmInfo?.javaVersion || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">堆内存使用率:</span>
              <el-progress
                :percentage="monitorInfo.jvmInfo?.heapUsage || 0"
                :color="getUsageColor(monitorInfo.jvmInfo?.heapUsage)"
                :format="(percentage) => `${percentage}%`"
              />
            </div>
            <div class="info-item">
              <span class="label">非堆内存使用率:</span>
              <el-progress
                :percentage="monitorInfo.jvmInfo?.nonHeapUsage || 0"
                :color="getUsageColor(monitorInfo.jvmInfo?.nonHeapUsage)"
                :format="(percentage) => `${percentage}%`"
              />
            </div>
            <div class="info-item">
              <span class="label">线程总数:</span>
              <span class="value">{{ monitorInfo.jvmInfo?.threadCount || '-' }}</span>
            </div>
          </el-card>
        </el-col>
        
        <!-- Redis信息卡片 -->
        <el-col :span="8">
          <el-card shadow="hover">
            <template #header>
              <div class="card-title">
                <el-icon><DataBase /></el-icon>
                <span>Redis信息</span>
              </div>
            </template>
            <div class="info-item">
              <span class="label">Redis版本:</span>
              <span class="value">{{ monitorInfo.redisInfo?.version || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">内存使用率:</span>
              <el-progress
                :percentage="monitorInfo.redisInfo?.memoryUsage || 0"
                :color="getUsageColor(monitorInfo.redisInfo?.memoryUsage)"
                :format="(percentage) => `${percentage}%`"
              />
            </div>
            <div class="info-item">
              <span class="label">命中率:</span>
              <el-progress
                :percentage="monitorInfo.redisInfo?.hitRate || 0"
                :color="getHitRateColor(monitorInfo.redisInfo?.hitRate)"
                :format="(percentage) => `${percentage}%`"
              />
            </div>
            <div class="info-item">
              <span class="label">客户端连接数:</span>
              <span class="value">{{ monitorInfo.redisInfo?.connectedClients || '-' }}</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 在线用户列表 -->
      <el-card style="margin-top: 20px;">
        <template #header>
          <div class="card-title">
            <el-icon><User /></el-icon>
            <span>在线用户 ({{ monitorInfo.onlineUserCount || 0 }})</span>
          </div>
        </template>
        <el-table
          :data="monitorInfo.onlineUsers || []"
          border
          stripe
          style="width: 100%"
          max-height="400"
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
        </el-table>
      </el-card>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Refresh, Monitor, Cpu, DataBase, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getMonitorInfo as getMonitorInfoApi } from '@/api/monitor'

const loading = ref(false)
const monitorInfo = ref({})

// 获取综合监控信息
const fetchMonitorInfo = async () => {
  loading.value = true
  try {
    const res = await getMonitorInfoApi()
    if (res.code === '200' && res.data) {
      monitorInfo.value = res.data
    } else {
      ElMessage.error(res.message || '获取监控信息失败')
    }
  } catch (error) {
    console.error('获取监控信息失败:', error)
    ElMessage.error('获取监控信息失败')
  } finally {
    loading.value = false
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

// 根据使用率获取颜色
const getUsageColor = (usage) => {
  if (!usage && usage !== 0) return '#909399'
  if (usage < 50) return '#67c23a'
  if (usage < 80) return '#e6a23c'
  return '#f56c6c'
}

// 根据命中率获取颜色
const getHitRateColor = (rate) => {
  if (!rate && rate !== 0) return '#909399'
  if (rate >= 80) return '#67c23a'
  if (rate >= 50) return '#e6a23c'
  return '#f56c6c'
}

onMounted(() => {
  fetchMonitorInfo()
})
</script>

<style scoped>
.monitor-info-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-item {
  margin-bottom: 15px;
}

.info-item .label {
  display: inline-block;
  width: 120px;
  color: #606266;
  font-size: 14px;
}

.info-item .value {
  color: #303133;
  font-weight: 500;
}
</style>

