<template>
  <div class="operlog-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>操作日志</span>
          <div>
            <el-button
              type="danger"
              :icon="Delete"
              :disabled="selectedIds.length === 0"
              @click="handleBatchDelete"
            >
              批量删除
            </el-button>
            <el-button
              type="danger"
              :icon="Delete"
              @click="handleClean"
              style="margin-left: 10px"
            >
              清空日志
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="操作模块">
          <el-input v-model="searchForm.title" placeholder="请输入操作模块" clearable @clear="handleSearch" style="width: 180px" />
        </el-form-item>
        <el-form-item label="业务类型">
          <el-select v-model="searchForm.businessType" placeholder="请选择业务类型" clearable @clear="handleSearch" style="width: 150px">
            <el-option label="其它" :value="0" />
            <el-option label="新增" :value="1" />
            <el-option label="修改" :value="2" />
            <el-option label="删除" :value="3" />
            <el-option label="查询" :value="4" />
            <el-option label="导出" :value="5" />
            <el-option label="导入" :value="6" />
          </el-select>
        </el-form-item>
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
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="日志ID" width="100" show-overflow-tooltip/>
        <el-table-column prop="title" label="操作模块" width="150" />
        <el-table-column prop="businessType" label="业务类型" width="120">
          <template #default="scope">
            <el-tag :type="getBusinessTypeTagType(scope.row.businessType)">
              {{ formatBusinessType(scope.row.businessType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="requestMethod" label="请求方式" width="100">
          <template #default="scope">
            <el-tag :type="getRequestMethodTagType(scope.row.requestMethod)">
              {{ scope.row.requestMethod }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operName" label="操作人员" width="120" />
        <el-table-column prop="operUrl" label="请求URL" min-width="200" show-overflow-tooltip />
        <el-table-column prop="operIp" label="操作IP" width="130" />
        <el-table-column prop="operLocation" label="操作地点" width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">
              {{ formatStatus(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="costTime" label="消耗时间" width="100">
          <template #default="scope">
            {{ scope.row.costTime ? `${scope.row.costTime}ms` : '-' }}
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
      v-loading="detailLoading"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="日志ID">{{ detailData.id }}</el-descriptions-item>
        <el-descriptions-item label="操作模块">{{ detailData.title }}</el-descriptions-item>
        <el-descriptions-item label="业务类型">
          <el-tag :type="getBusinessTypeTagType(detailData.businessType)">
            {{ formatBusinessType(detailData.businessType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="请求方式">
          <el-tag :type="getRequestMethodTagType(detailData.requestMethod)">
            {{ detailData.requestMethod }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作人员">{{ detailData.operName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="操作人员ID">{{ detailData.operId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="部门名称">{{ detailData.deptName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="操作类别">
          {{ formatOperatorType(detailData.operatorType) }}
        </el-descriptions-item>
        <el-descriptions-item label="操作IP">{{ detailData.operIp || '-' }}</el-descriptions-item>
        <el-descriptions-item label="操作地点">{{ detailData.operLocation || '-' }}</el-descriptions-item>
        <el-descriptions-item label="操作状态">
          <el-tag :type="detailData.status === 0 ? 'success' : 'danger'">
            {{ formatStatus(detailData.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="消耗时间">
          {{ detailData.costTime ? `${detailData.costTime}ms` : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ formatDate(detailData.operTime) }}</el-descriptions-item>
        <el-descriptions-item label="租户ID">{{ detailData.tenantId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="请求URL" :span="2">{{ detailData.operUrl || '-' }}</el-descriptions-item>
        <el-descriptions-item label="请求方法" :span="2">{{ detailData.method || '-' }}</el-descriptions-item>
        <el-descriptions-item label="请求参数" :span="2">
          <pre class="json-content">{{ formatJson(detailData.operParam) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="返回结果" :span="2">
          <pre class="json-content">{{ formatJson(detailData.jsonResult) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="错误信息" :span="2" v-if="detailData.errorMsg">
          <pre class="error-content">{{ detailData.errorMsg }}</pre>
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
import { getOperLogList, getOperLogById, deleteOperLog, batchDeleteOperLog, cleanOperLog } from '@/api/operlog'

// 搜索表单
const searchForm = reactive({
  title: '',
  businessType: null,
  operName: '',
  status: null,
  operTimeStart: null,
  operTimeEnd: null
})

const dateRange = ref(null)

// 表格数据
const tableData = ref([])
const loading = ref(false)
const selectedIds = ref([])

// 分页数据
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 详情对话框
const detailDialogVisible = ref(false)
const detailLoading = ref(false)
const detailData = ref({})

// 获取操作日志列表
const fetchOperLogList = async () => {
  loading.value = true
  try {
    const pageParams = {
      current: pagination.current,
      size: pagination.size
    }
    
    const queryData = {
      title: searchForm.title || undefined,
      businessType: searchForm.businessType !== null && searchForm.businessType !== undefined ? searchForm.businessType : undefined,
      operName: searchForm.operName || undefined,
      status: searchForm.status !== null && searchForm.status !== undefined ? searchForm.status : undefined,
      operTimeStart: searchForm.operTimeStart || undefined,
      operTimeEnd: searchForm.operTimeEnd || undefined
    }
    
    const res = await getOperLogList(pageParams, queryData)
    if (res.code === '200' && res.data) {
      tableData.value = res.data.records || []
      pagination.total = res.data.total || 0
    } else {
      ElMessage.error(res.message || '获取操作日志列表失败')
    }
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
    searchForm.operTimeStart = dates[0]
    searchForm.operTimeEnd = dates[1]
  } else {
    searchForm.operTimeStart = null
    searchForm.operTimeEnd = null
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchOperLogList()
}

// 重置
const handleReset = () => {
  searchForm.title = ''
  searchForm.businessType = null
  searchForm.operName = ''
  searchForm.status = null
  searchForm.operTimeStart = null
  searchForm.operTimeEnd = null
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

// 表格选择改变
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
}

// 格式化业务类型
const formatBusinessType = (type) => {
  const typeMap = {
    0: '其它',
    1: '新增',
    2: '修改',
    3: '删除',
    4: '查询',
    5: '导出',
    6: '导入'
  }
  return typeMap[type] || '其它'
}

// 获取业务类型标签类型
const getBusinessTypeTagType = (type) => {
  const typeMap = {
    0: 'info',
    1: 'success',
    2: 'warning',
    3: 'danger',
    4: '',
    5: 'success',
    6: 'warning'
  }
  return typeMap[type] || 'info'
}

// 获取请求方式标签类型
const getRequestMethodTagType = (method) => {
  if (!method) return ''
  const methodUpper = method.toUpperCase()
  if (methodUpper === 'GET') return 'success'
  if (methodUpper === 'POST') return 'primary'
  if (methodUpper === 'PUT') return 'warning'
  if (methodUpper === 'DELETE') return 'danger'
  return ''
}

// 格式化操作类别
const formatOperatorType = (type) => {
  const typeMap = {
    0: '其它',
    1: '后台用户',
    2: '手机端用户'
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
  if (typeof dateString === 'string') {
    return dateString.replace('T', ' ').substring(0, 19)
  }
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 格式化JSON
const formatJson = (jsonString) => {
  if (!jsonString) return '-'
  try {
    const obj = JSON.parse(jsonString)
    return JSON.stringify(obj, null, 2)
  } catch (e) {
    return jsonString
  }
}

// 查看详情
const handleView = async (row) => {
  detailDialogVisible.value = true
  detailLoading.value = true
  try {
    const res = await getOperLogById(row.id)
    if (res.code === '200' && res.data) {
      detailData.value = res.data
    } else {
      ElMessage.error(res.message || '获取操作日志详情失败')
      detailData.value = { ...row }
    }
  } catch (error) {
    console.error('获取操作日志详情失败:', error)
    ElMessage.error('获取操作日志详情失败')
    detailData.value = { ...row }
  } finally {
    detailLoading.value = false
  }
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
    
    const res = await deleteOperLog(row.id)
    if (res.code === '200') {
      ElMessage.success('删除成功')
      fetchOperLogList()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除操作日志失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的日志')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 条操作日志吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const res = await batchDeleteOperLog(selectedIds.value)
    if (res.code === '200') {
      ElMessage.success('批量删除成功')
      selectedIds.value = []
      fetchOperLogList()
    } else {
      ElMessage.error(res.message || '批量删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除操作日志失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 清空日志
const handleClean = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有操作日志吗？此操作不可恢复！',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const res = await cleanOperLog()
    if (res.code === '200') {
      ElMessage.success('清空日志成功')
      fetchOperLogList()
    } else {
      ElMessage.error(res.message || '清空日志失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清空操作日志失败:', error)
      ElMessage.error('清空日志失败')
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

.json-content,
.error-content {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.error-content {
  color: #f56c6c;
}
</style>
