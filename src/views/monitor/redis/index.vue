<template>
  <div class="redis-monitor-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>Redis信息</span>
          <el-button type="primary" :icon="Refresh" @click="fetchRedisInfo">刷新</el-button>
        </div>
      </template>
      
      <el-row :gutter="20" v-loading="loading">
        <el-col :span="12">
          <el-descriptions title="基本信息" :column="1" border>
            <el-descriptions-item label="Redis版本">
              {{ redisInfo.version || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="运行模式">
              {{ redisInfo.mode || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="运行端口">
              {{ redisInfo.port || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="客户端连接数">
              {{ redisInfo.connectedClients || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-col>
        
        <el-col :span="12">
          <el-descriptions title="内存信息" :column="1" border>
            <el-descriptions-item label="内存使用率">
              <el-progress
                :percentage="redisInfo.memoryUsage || 0"
                :color="getUsageColor(redisInfo.memoryUsage)"
                :format="(percentage) => `${percentage}%`"
              />
            </el-descriptions-item>
            <el-descriptions-item label="已使用内存">
              {{ formatMemory(redisInfo.usedMemory) }}
            </el-descriptions-item>
            <el-descriptions-item label="内存峰值">
              {{ formatMemory(redisInfo.usedMemoryPeak) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>缓存统计</span>
            </template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="命中次数">
                {{ redisInfo.keyspaceHits || 0 }}
              </el-descriptions-item>
              <el-descriptions-item label="未命中次数">
                {{ redisInfo.keyspaceMisses || 0 }}
              </el-descriptions-item>
              <el-descriptions-item label="命中率">
                <el-progress
                  :percentage="redisInfo.hitRate || 0"
                  :color="getHitRateColor(redisInfo.hitRate)"
                  :format="(percentage) => `${percentage}%`"
                />
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>命令统计</span>
            </template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="总命令数">
                {{ redisInfo.totalCommandsProcessed || 0 }}
              </el-descriptions-item>
              <el-descriptions-item label="每秒命令数">
                {{ redisInfo.commandsPerSecond ? redisInfo.commandsPerSecond.toFixed(2) : 0 }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
      </el-row>
      
      <el-card style="margin-top: 20px;" v-if="redisInfo.keyspace && Object.keys(redisInfo.keyspace).length > 0">
        <template #header>
          <span>键空间信息</span>
        </template>
        <el-table :data="keyspaceData" border>
          <el-table-column prop="db" label="数据库" />
          <el-table-column prop="keys" label="键数量" />
          <el-table-column prop="expires" label="过期键数量" />
        </el-table>
      </el-card>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getRedisInfo as getRedisInfoApi } from '@/api/monitor'

const loading = ref(false)
const redisInfo = ref({})

// 键空间数据
const keyspaceData = computed(() => {
  if (!redisInfo.value.keyspace) return []
  return Object.entries(redisInfo.value.keyspace).map(([db, info]) => {
    // info格式通常是 "keys=100,expires=10"
    const parts = info.split(',')
    const keys = parts.find(p => p.startsWith('keys='))?.split('=')[1] || '0'
    const expires = parts.find(p => p.startsWith('expires='))?.split('=')[1] || '0'
    return {
      db,
      keys,
      expires
    }
  })
})

// 获取Redis信息
const fetchRedisInfo = async () => {
  loading.value = true
  try {
    const res = await getRedisInfoApi()
    if (res.code === '200' && res.data) {
      redisInfo.value = res.data
    } else {
      ElMessage.error(res.message || '获取Redis信息失败')
    }
  } catch (error) {
    console.error('获取Redis信息失败:', error)
    ElMessage.error('获取Redis信息失败')
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
  fetchRedisInfo()
})
</script>

<style scoped>
.redis-monitor-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

