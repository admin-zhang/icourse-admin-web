<template>
  <div class="order-page">
    <el-card>
      <template #header>
        <span>订单管理</span>
      </template>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="id" label="订单号" width="150" />
        <el-table-column prop="courseName" label="课程名称" />
        <el-table-column prop="userName" label="用户" width="120" />
        <el-table-column prop="amount" label="金额" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="150">
          <template #default>
            <el-button type="primary" link>详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const tableData = ref([
  {
    id: 'ORD20240101001',
    courseName: 'Vue3 从入门到精通',
    userName: '张三',
    amount: '¥199',
    status: '已支付',
    createTime: '2024-01-01 10:00:00'
  },
  {
    id: 'ORD20240101002',
    courseName: 'Spring Boot 实战',
    userName: '李四',
    amount: '¥299',
    status: '待支付',
    createTime: '2024-01-01 11:00:00'
  }
])

const getStatusType = (status) => {
  const statusMap = {
    '已支付': 'success',
    '待支付': 'warning',
    '已取消': 'info',
    '已退款': 'danger'
  }
  return statusMap[status] || 'info'
}
</script>

<style scoped>
.order-page {
  padding: 20px;
}
</style>

