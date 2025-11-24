<template>
  <div class="user-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增用户</el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.userName" placeholder="请输入用户名" clearable @clear="handleSearch" style="width: 180px" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchForm.phoneNumber" placeholder="请输入手机号" clearable @clear="handleSearch" style="width: 180px" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="searchForm.email" placeholder="请输入邮箱" clearable @clear="handleSearch" style="width: 200px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable @clear="handleSearch" style="width: 150px">
            <el-option label="正常" :value="0" />
            <el-option label="禁用" :value="1" />
          </el-select>
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
        <el-table-column prop="id" label="ID" width="100" show-overflow-tooltip/>
        <el-table-column prop="userName" label="用户名" width="120" />
        <el-table-column prop="nickName" label="昵称" width="120" />
        <el-table-column label="头像" width="80">
          <template #default="scope">
            <el-avatar :src="scope.row.icon" :size="40" />
          </template>
        </el-table-column>
        <el-table-column prop="phoneNumber" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="sex" label="性别" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.sex === '1' ? 'success' : scope.row.sex === '2' ? 'danger' : 'info'">
              {{ formatSex(scope.row.sex) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">
              {{ formatStatus(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Edit, Delete } from '@element-plus/icons-vue'
import { getUserList, deleteUser } from '@/api/user'

// 搜索表单
const searchForm = reactive({
  userName: '',
  phoneNumber: '',
  email: '',
  status: null
})

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 分页数据
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
  pages: 0
})

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
    // 分页参数（URL参数，用于Page对象）
    const pageParams = {
      current: pagination.current,
      size: pagination.size
    }
    
    // 查询条件（请求体，用于QuerySmsAdminDTO）
    const queryData = {}
    if (searchForm.userName) {
      queryData.userName = searchForm.userName
    }
    if (searchForm.phoneNumber) {
      queryData.phoneNumber = searchForm.phoneNumber
    }
    if (searchForm.email) {
      queryData.email = searchForm.email
    }
    if (searchForm.status !== null && searchForm.status !== undefined && searchForm.status !== '') {
      queryData.status = searchForm.status
    }

    const res = await getUserList(pageParams, queryData)
    if (res.data) {
      tableData.value = res.data.records || []
      pagination.total = res.data.total || 0
      pagination.pages = res.data.pages || 0
      pagination.current = res.data.current || 1
      pagination.size = res.data.size || 10
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchUserList()
}

// 重置
const handleReset = () => {
  searchForm.userName = ''
  searchForm.phoneNumber = ''
  searchForm.email = ''
  searchForm.status = null
  pagination.current = 1
  fetchUserList()
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.current = 1
  fetchUserList()
}

// 当前页改变
const handleCurrentChange = (current) => {
  pagination.current = current
  fetchUserList()
}

// 格式化性别
const formatSex = (sex) => {
  const sexMap = {
    '0': '男',
    '1': '女',
    '2': '保密'
  }
  return sexMap[sex] || '保密'
}

// 格式化状态
const formatStatus = (status) => {
  return status === 0 ? '正常' : '禁用'
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

// 新增用户
const handleAdd = () => {
  ElMessage.info('新增用户功能待实现')
  // TODO: 实现新增用户功能
}

// 编辑用户
const handleEdit = (row) => {
  ElMessage.info('编辑用户功能待实现')
  // TODO: 实现编辑用户功能
}

// 删除用户
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${row.userName}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    fetchUserList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
    }
  }
}

// 初始化
onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
.user-page {
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
</style>
