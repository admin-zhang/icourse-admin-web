<template>
  <div class="operlog-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>操作日志</span>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="操作人员">
          <el-input v-model="searchForm.operName" placeholder="请输入操作人员" clearable @clear="handleSearch" style="width: 180px" />
        </el-form-item>
        <el-form-item label="操作状态">
          <el-select v-model="searchForm.status" placeholder="请选择操作状态" clearable @clear="handleSearch" style="width: 150px">
            <el-option label="成功" :value="0" />
            <el-option label="失败" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD HH:mm:ss"
            @change="handleDateChange"
            style="width: 400px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        border
        stripe
      >
        <el-table-column prop="id" label="日志ID" width="100" show-overflow-tooltip/>
        <el-table-column prop="title" label="操作模块" width="150" />
        <el-table-column prop="businessType" label="业务类型" width="120">
          <template #default="scope">
            {{ formatBusinessType(scope.row.businessType) }}
          </template>
        </el-table-column>
        <el-table-column prop="method" label="请求方法" width="150" show-overflow-tooltip />
        <el-table-column prop="requestMethod" label="请求方式" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.requestMethod === 'GET' ? 'success' : 'primary'">
              {{ scope.row.requestMethod }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operName" label="操作人员" width="120" />
        <el-table-column prop="operUrl" label="请求URL" min-width="200" show-overflow-tooltip />
        <el-table-column prop="operIp" label="操作IP" width="130" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">
              {{ formatStatus(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operTime" label="操作时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.operTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" link :icon="View" @click="handleView(scope.row)">详情</el-button>
            <el-button type="danger" link :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="操作日志详情"
      width="800px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="日志ID">{{ detailData.id }}</el-descriptions-item>
        <el-descriptions-item label="操作模块">{{ detailData.title }}</el-descriptions-item>
        <el-descriptions-item label="业务类型">{{ formatBusinessType(detailData.businessType) }}</el-descriptions-item>
        <el-descriptions-item label="请求方式">{{ detailData.requestMethod }}</el-descriptions-item>
        <el-descriptions-item label="操作人员">{{ detailData.operName }}</el-descriptions-item>
        <el-descriptions-item label="操作IP">{{ detailData.operIp }}</el-descriptions-item>
        <el-descriptions-item label="操作状态">
          <el-tag :type="detailData.status === 0 ? 'success' : 'danger'">
            {{ formatStatus(detailData.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ formatDate(detailData.operTime) }}</el-descriptions-item>
        <el-descriptions-item label="请求URL" :span="2">{{ detailData.operUrl }}</el-descriptions-item>
        <el-descriptions-item label="请求方法" :span="2">{{ detailData.method }}</el-descriptions-item>
        <el-descriptions-item label="请求参数" :span="2">
          <pre style="white-space: pre-wrap; word-wrap: break-word;">{{ detailData.operParam || '-' }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="返回结果" :span="2">
          <pre style="white-space: pre-wrap; word-wrap: break-word;">{{ detailData.jsonResult || '-' }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="错误信息" :span="2" v-if="detailData.errorMsg">
          <pre style="white-space: pre-wrap; word-wrap: break-word; color: red;">{{ detailData.errorMsg }}</pre>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, View, Delete } from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  operName: '',
  status: null,
  startTime: null,
  endTime: null
})

const dateRange = ref(null)

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 分页数据
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 详情对话框
const detailDialogVisible = ref(false)
const detailData = ref({})

// 获取操作日志列表
const fetchOperLogList = async () => {
  loading.value = true
  try {
    // TODO: 这里需要根据实际的后端API来调用
    // 目前先使用模拟数据
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟数据
    tableData.value = [
      {
        id: 1,
        title: '用户管理',
        businessType: 1,
        method: 'com.example.controller.UserController.list',
        requestMethod: 'GET',
        operName: 'admin',
        operUrl: '/api/user/list',
        operIp: '127.0.0.1',
        status: 0,
        operTime: new Date().toISOString(),
        operParam: '{"page":1,"size":10}',
        jsonResult: '{"code":"200","message":"操作成功"}'
      }
    ]
    pagination.total = 1
    
    // 实际调用应该是：
    // const res = await getOperLogList(pageParams, queryData)
    // if (res.code === '200' && res.data) {
    //   tableData.value = res.data.records || []
    //   pagination.total = res.data.total || 0
    // }
  } catch (error) {
    console.error('获取操作日志列表失败:', error)
    ElMessage.error('获取操作日志列表失败')
  } finally {
    loading.value = false
  }
}

// 日期范围改变
const handleDateChange = (dates) => {
  if (dates && dates.length === 2) {
    searchForm.startTime = dates[0]
    searchForm.endTime = dates[1]
  } else {
    searchForm.startTime = null
    searchForm.endTime = null
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchOperLogList()
}

// 重置
const handleReset = () => {
  searchForm.operName = ''
  searchForm.status = null
  searchForm.startTime = null
  searchForm.endTime = null
  dateRange.value = null
  pagination.current = 1
  fetchOperLogList()
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.current = 1
  fetchOperLogList()
}

// 当前页改变
const handleCurrentChange = (current) => {
  pagination.current = current
  fetchOperLogList()
}

// 格式化业务类型
const formatBusinessType = (type) => {
  const typeMap = {
    0: '其它',
    1: '新增',
    2: '修改',
    3: '删除',
    4: '授权',
    5: '导出',
    6: '导入',
    7: '强退',
    8: '生成代码',
    9: '清空数据'
  }
  return typeMap[type] || '其它'
}

// 格式化状态
const formatStatus = (status) => {
  return status === 0 ? '成功' : '失败'
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 查看详情
const handleView = (row) => {
  detailData.value = { ...row }
  detailDialogVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除这条操作日志吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // TODO: 调用删除API
    // await deleteOperLog(row.id)
    ElMessage.success('删除成功')
    fetchOperLogList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除操作日志失败:', error)
    }
  }
}

// 初始化
onMounted(() => {
  fetchOperLogList()
})
</script>

<style scoped>
.operlog-page {
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  max-height: 200px;
  overflow-y: auto;
}
</style>

