<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">1,234</div>
            <div class="stat-label">总用户数</div>
          </div>
          <el-icon class="stat-icon" color="#409EFF"><UserFilled /></el-icon>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">56</div>
            <div class="stat-label">课程总数</div>
          </div>
          <el-icon class="stat-icon" color="#67C23A"><Reading /></el-icon>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">890</div>
            <div class="stat-label">订单总数</div>
          </div>
          <el-icon class="stat-icon" color="#E6A23C"><ShoppingCart /></el-icon>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">¥12,345</div>
            <div class="stat-label">总收入</div>
          </div>
          <el-icon class="stat-icon" color="#F56C6C"><Money /></el-icon>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="welcome-card" style="margin-top: 20px">
      <h2>欢迎使用 iCourse 管理后台</h2>
      <p>当前登录管理员：{{ userStore.nickName || userStore.username }}</p>
      <p>用户ID：{{ userStore.userId }}</p>
    </el-card>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { UserFilled, Reading, ShoppingCart, Money } from '@element-plus/icons-vue'

const userStore = useUserStore()
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stat-card {
  position: relative;
  overflow: hidden;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 14px;
  color: #999;
}

.stat-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 48px;
  opacity: 0.3;
}

.welcome-card {
  text-align: center;
}

.welcome-card h2 {
  margin-bottom: 20px;
  color: #333;
}

.welcome-card p {
  margin: 10px 0;
  color: #666;
  font-size: 16px;
}
</style>

