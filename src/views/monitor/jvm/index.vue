<template>
  <div class="jvm-monitor-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>JVM信息</span>
          <el-button type="primary" :icon="Refresh" @click="fetchJvmInfo">刷新</el-button>
        </div>
      </template>
      
      <el-row :gutter="20" v-loading="loading">
        <el-col :span="12">
          <el-descriptions title="JVM基本信息" :column="1" border>
            <el-descriptions-item label="JVM名称">
              {{ jvmInfo.jvmName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="JVM版本">
              {{ jvmInfo.jvmVersion || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="JVM供应商">
              {{ jvmInfo.jvmVendor || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="Java版本">
              {{ jvmInfo.javaVersion || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="Java供应商">
              {{ jvmInfo.javaVendor || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="启动时间">
              {{ formatTime(jvmInfo.startTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="运行时长">
              {{ formatUptime(jvmInfo.uptime) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-col>
        
        <el-col :span="12">
          <el-descriptions title="线程信息" :column="1" border>
            <el-descriptions-item label="线程总数">
              {{ jvmInfo.threadCount || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="守护线程数">
              {{ jvmInfo.daemonThreadCount || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="峰值线程数">
              {{ jvmInfo.peakThreadCount || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>堆内存</span>
            </template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="使用率">
                <el-progress
                  :percentage="jvmInfo.heapUsage || 0"
                  :color="getUsageColor(jvmInfo.heapUsage)"
                  :format="(percentage) => `${percentage}%`"
                />
              </el-descriptions-item>
              <el-descriptions-item label="已用">
                {{ formatMemory(jvmInfo.heapUsed) }}
              </el-descriptions-item>
              <el-descriptions-item label="可用">
                {{ formatMemory(jvmInfo.heapFree) }}
              </el-descriptions-item>
              <el-descriptions-item label="总计">
                {{ formatMemory(jvmInfo.heapTotal) }}
              </el-descriptions-item>
              <el-descriptions-item label="最大">
                {{ formatMemory(jvmInfo.maxHeapMemory) }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>非堆内存</span>
            </template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="使用率">
                <el-progress
                  :percentage="jvmInfo.nonHeapUsage || 0"
                  :color="getUsageColor(jvmInfo.nonHeapUsage)"
                  :format="(percentage) => `${percentage}%`"
                />
              </el-descriptions-item>
              <el-descriptions-item label="已用">
                {{ formatMemory(jvmInfo.nonHeapUsed) }}
              </el-descriptions-item>
              <el-descriptions-item label="可用">
                {{ formatMemory(jvmInfo.nonHeapFree) }}
              </el-descriptions-item>
              <el-descriptions-item label="总计">
                {{ formatMemory(jvmInfo.nonHeapTotal) }}
              </el-descriptions-item>
              <el-descriptions-item label="最大">
                {{ formatMemory(jvmInfo.maxNonHeapMemory) }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
      </el-row>
      
      <el-card style="margin-top: 20px;" v-if="jvmInfo.gcInfos && jvmInfo.gcInfos.length > 0">
        <template #header>
          <span>GC信息</span>
        </template>
        <el-table :data="jvmInfo.gcInfos" border>
          <el-table-column prop="name" label="GC名称" />
          <el-table-column prop="collectionCount" label="GC次数" />
          <el-table-column prop="collectionTime" label="GC总耗时(ms)" />
        </el-table>
      </el-card>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getJvmInfo as getJvmInfoApi } from '@/api/monitor'

const loading = ref(false)
const jvmInfo = ref({})

// 获取JVM信息
const fetchJvmInfo = async () => {
  loading.value = true
  try {
    const res = await getJvmInfoApi()
    if (res.code === '200' && res.data) {
      jvmInfo.value = res.data
    } else {
      ElMessage.error(res.message || '获取JVM信息失败')
    }
  } catch (error) {
    console.error('获取JVM信息失败:', error)
    ElMessage.error('获取JVM信息失败')
  } finally {
    loading.value = false
  }
}

// 格式化内存大小
const formatMemory = (mb) => {
  if (!mb && mb !== 0) return '-'
  if (mb < 1024) {
    return `${mb} MB`
  }
  return `${(mb / 1024).toFixed(2)} GB`
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString('zh-CN')
}

// 格式化运行时长
const formatUptime = (ms) => {
  if (!ms) return '-'
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    return `${days}天 ${hours % 24}小时 ${minutes % 60}分钟`
  } else if (hours > 0) {
    return `${hours}小时 ${minutes % 60}分钟`
  } else if (minutes > 0) {
    return `${minutes}分钟 ${seconds % 60}秒`
  }
  return `${seconds}秒`
}

// 根据使用率获取颜色
const getUsageColor = (usage) => {
  if (!usage && usage !== 0) return '#909399'
  if (usage < 50) return '#67c23a'
  if (usage < 80) return '#e6a23c'
  return '#f56c6c'
}

onMounted(() => {
  fetchJvmInfo()
})
</script>

<style scoped>
.jvm-monitor-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

