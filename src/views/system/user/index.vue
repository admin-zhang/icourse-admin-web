<template>
  <div class="admin-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>管理员管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增管理员</el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="用户账号">
          <el-input v-model="searchForm.userName" placeholder="请输入用户账号" clearable @clear="handleSearch" style="width: 180px" />
        </el-form-item>
        <el-form-item label="用户昵称">
          <el-input v-model="searchForm.nickName" placeholder="请输入用户昵称" clearable @clear="handleSearch" style="width: 180px" />
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input v-model="searchForm.phoneNumber" placeholder="请输入手机号码" clearable @clear="handleSearch" style="width: 180px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable @clear="handleSearch" style="width: 150px">
            <el-option label="正常" :value="'0'" />
            <el-option label="异常" :value="'1'" />
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
        <el-table-column prop="userName" label="用户账号" width="120" />
        <el-table-column prop="nickName" label="用户昵称" width="120" />
        <el-table-column label="头像" width="80">
          <template #default="scope">
            <el-avatar :src="scope.row.icon" :size="40" />
          </template>
        </el-table-column>
        <el-table-column prop="phoneNumber" label="手机号码" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="sex" label="性别" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.sex === '1' ? 'success' : scope.row.sex === '2' ? 'info' : 'primary'">
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
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="scope">
            <el-button type="primary" link :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="success" link :icon="UserFilled" @click="handleAssignRole(scope.row)">分配角色</el-button>
            <el-button type="warning" link :icon="Key" @click="handleChangePassword(scope.row)">修改密码</el-button>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="用户账号" prop="userName">
          <el-input v-model="formData.userName" placeholder="请输入用户账号" />
        </el-form-item>
        <el-form-item v-if="!formData.id" label="密码" prop="passWord">
          <el-input v-model="formData.passWord" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="用户昵称" prop="nickName">
          <el-input v-model="formData.nickName" placeholder="请输入用户昵称" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phoneNumber">
          <el-input v-model="formData.phoneNumber" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="formData.sex">
            <el-radio label="0">男</el-radio>
            <el-radio label="1">女</el-radio>
            <el-radio label="2">保密</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="0">正常</el-radio>
            <el-radio :label="1">异常</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="500px"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="原密码" prop="oldPassWord">
          <el-input v-model="passwordForm.oldPassWord" type="password" placeholder="请输入原密码" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassWord">
          <el-input v-model="passwordForm.newPassWord" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handlePasswordSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
      v-model="roleDialogVisible"
      title="分配角色"
      width="600px"
    >
      <div class="role-assign-info">
        <p><strong>管理员：</strong>{{ currentAdmin.userName }}（{{ currentAdmin.nickName }}）</p>
      </div>
      <el-divider />
      <div class="role-list-container">
        <el-checkbox-group v-model="selectedRoleIds" v-loading="roleLoading">
          <el-checkbox
            v-for="role in allRoles"
            :key="role.id"
            :label="role.id"
            :disabled="role.status === 1"
          >
            <span>{{ role.roleName }}</span>
            <el-tag v-if="role.status === 1" type="danger" size="small" style="margin-left: 8px">已停用</el-tag>
          </el-checkbox>
        </el-checkbox-group>
        <el-empty v-if="!roleLoading && allRoles.length === 0" description="暂无可用角色" />
      </div>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRoleSubmit" :loading="roleSubmitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Edit, Delete, Key, UserFilled } from '@element-plus/icons-vue'
import { getAdminList, getAdminById, addAdmin, updateAdmin, deleteAdmin, changePassword } from '@/api/admin'
import { getAllRoles, assignRole, getRolesByAdminId } from '@/api/role'

// 搜索表单
const searchForm = reactive({
  userName: '',
  nickName: '',
  phoneNumber: '',
  status: null
})

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 分页数据
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 对话框
const dialogVisible = ref(false)
const passwordDialogVisible = ref(false)
const roleDialogVisible = ref(false)
const dialogTitle = ref('新增管理员')
const formRef = ref(null)
const passwordFormRef = ref(null)

// 分配角色相关
const currentAdmin = ref({})
const allRoles = ref([])
const selectedRoleIds = ref([])
const roleLoading = ref(false)
const roleSubmitting = ref(false)

// 表单数据
const formData = reactive({
  id: null,
  userName: '',
  passWord: '',
  nickName: '',
  phoneNumber: '',
  email: '',
  sex: '2',
  status: 0
})

// 密码表单数据
const passwordForm = reactive({
  id: null,
  oldPassWord: '',
  newPassWord: ''
})

// 表单验证规则
const formRules = {
  userName: [
    { required: true, message: '请输入用户账号', trigger: 'blur' },
    { max: 32, message: '用户账号最大长度要小于32', trigger: 'blur' }
  ],
  phoneNumber: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  passWord: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { max: 16, message: '密码最大长度要小于16', trigger: 'blur' }
  ]
}

// 密码表单验证规则
const passwordRules = {
  oldPassWord: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassWord: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { max: 16, message: '密码最大长度要小于16', trigger: 'blur' }
  ]
}

// 获取管理员列表
const fetchAdminList = async () => {
  loading.value = true
  try {
    const pageParams = {
      current: pagination.current,
      size: pagination.size
    }
    
    const queryData = {}
    if (searchForm.userName) queryData.userName = searchForm.userName
    if (searchForm.nickName) queryData.nickName = searchForm.nickName
    if (searchForm.phoneNumber) queryData.phoneNumber = searchForm.phoneNumber
    if (searchForm.status !== null && searchForm.status !== undefined && searchForm.status !== '') {
      queryData.status = searchForm.status
    }

    const res = await getAdminList(pageParams, queryData)
    if (res.code === '200' && res.data) {
      tableData.value = res.data.records || []
      pagination.total = res.data.total || 0
      pagination.current = res.data.current || 1
      pagination.size = res.data.size || 10
    }
  } catch (error) {
    console.error('获取管理员列表失败:', error)
    ElMessage.error('获取管理员列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchAdminList()
}

// 重置
const handleReset = () => {
  searchForm.userName = ''
  searchForm.nickName = ''
  searchForm.phoneNumber = ''
  searchForm.status = null
  pagination.current = 1
  fetchAdminList()
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.current = 1
  fetchAdminList()
}

// 当前页改变
const handleCurrentChange = (current) => {
  pagination.current = current
  fetchAdminList()
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
  return status === 0 ? '正常' : '异常'
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

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增管理员'
  Object.assign(formData, {
    id: null,
    userName: '',
    passWord: '',
    nickName: '',
    phoneNumber: '',
    email: '',
    sex: '2',
    status: 0
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = async (row) => {
  dialogTitle.value = '编辑管理员'
  try {
    const res = await getAdminById(row.id)
    if (res.code === '200' && res.data) {
      Object.assign(formData, {
        id: res.data.id,
        userName: res.data.userName,
        nickName: res.data.nickName || '',
        phoneNumber: res.data.phoneNumber,
        email: res.data.email || '',
        sex: res.data.sex || '2',
        status: res.data.status
      })
      dialogVisible.value = true
    }
  } catch (error) {
    console.error('获取管理员详情失败:', error)
    ElMessage.error('获取管理员详情失败')
  }
}

// 修改密码
const handleChangePassword = (row) => {
  passwordForm.id = row.id
  passwordForm.oldPassWord = ''
  passwordForm.newPassWord = ''
  passwordDialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const submitData = { ...formData }
        if (!submitData.id && !submitData.passWord) {
          ElMessage.warning('新增管理员时密码不能为空')
          return
        }
        
        if (submitData.id) {
          await updateAdmin(submitData)
          ElMessage.success('更新成功')
        } else {
          await addAdmin(submitData)
          ElMessage.success('新增成功')
        }
        
        dialogVisible.value = false
        fetchAdminList()
      } catch (error) {
        console.error('保存失败:', error)
      }
    }
  })
}

// 提交密码修改
const handlePasswordSubmit = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await changePassword({
          id: passwordForm.id,
          oldPassWord: passwordForm.oldPassWord,
          newPassWord: passwordForm.newPassWord
        })
        ElMessage.success('密码修改成功')
        passwordDialogVisible.value = false
      } catch (error) {
        console.error('密码修改失败:', error)
      }
    }
  })
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除管理员 "${row.userName}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteAdmin(row.id)
    ElMessage.success('删除成功')
    fetchAdminList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除管理员失败:', error)
    }
  }
}

// 分配角色
const handleAssignRole = async (row) => {
  currentAdmin.value = { ...row }
  selectedRoleIds.value = []
  roleDialogVisible.value = true
  
  // 加载所有角色
  roleLoading.value = true
  try {
    const rolesRes = await getAllRoles()
    if (rolesRes.code === '200' && rolesRes.data) {
      allRoles.value = rolesRes.data
    }
    
    // 加载当前管理员已分配的角色
    const adminRolesRes = await getRolesByAdminId(row.id)
    if (adminRolesRes.code === '200' && adminRolesRes.data) {
      selectedRoleIds.value = adminRolesRes.data.map(role => role.id)
    }
  } catch (error) {
    console.error('加载角色数据失败:', error)
    ElMessage.error('加载角色数据失败')
  } finally {
    roleLoading.value = false
  }
}

// 提交角色分配
const handleRoleSubmit = async () => {
  roleSubmitting.value = true
  try {
    await assignRole({
      adminId: currentAdmin.value.id,
      roleIds: selectedRoleIds.value
    })
    ElMessage.success('分配角色成功')
    roleDialogVisible.value = false
    fetchAdminList() // 刷新列表
  } catch (error) {
    console.error('分配角色失败:', error)
  } finally {
    roleSubmitting.value = false
  }
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

// 初始化
onMounted(() => {
  fetchAdminList()
})
</script>

<style scoped>
.admin-page {
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

.role-assign-info {
  margin-bottom: 10px;
}

.role-assign-info p {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.role-list-container {
  max-height: 400px;
  overflow-y: auto;
  padding: 10px 0;
}

.role-list-container :deep(.el-checkbox-group) {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.role-list-container :deep(.el-checkbox) {
  display: flex;
  align-items: center;
  height: auto;
  line-height: normal;
}
</style>

