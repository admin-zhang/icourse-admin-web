<template>
  <div class="tenant-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>租户管理</span>
          <el-button 
            type="primary" 
            :icon="Plus" 
            :disabled="!hasPermission('add', '新增')"
            @click="handleAdd"
          >
            新增租户
          </el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="租户名称">
          <el-input v-model="searchForm.name" placeholder="请输入租户名称" clearable @clear="handleSearch" style="width: 180px" />
        </el-form-item>
        <el-form-item label="租户编码">
          <el-input v-model="searchForm.tenantCode" placeholder="请输入租户编码" clearable @clear="handleSearch" style="width: 180px" />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="searchForm.contactName" placeholder="请输入联系人" clearable @clear="handleSearch" style="width: 180px" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchForm.contactPhone" placeholder="请输入手机号" clearable @clear="handleSearch" style="width: 180px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable @clear="handleSearch" style="width: 150px">
            <el-option label="启用" :value="0" />
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
        <el-table-column prop="tenantCode" label="租户编码" width="150" />
        <el-table-column prop="name" label="租户名称" width="200" />
        <el-table-column prop="contactName" label="联系人" width="120" />
        <el-table-column prop="contactPhone" label="手机号" width="130" />
        <el-table-column prop="contactEmail" label="邮箱" min-width="180" />
        <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="industry" label="行业" width="120" />
        <el-table-column prop="scale" label="企业规模" width="120" />
        <el-table-column label="有效期" width="200">
          <template #default="scope">
            <div v-if="scope.row.validFrom || scope.row.validTo">
              <div>{{ formatDate(scope.row.validFrom) || '-' }}</div>
              <div style="color: #909399; font-size: 12px;">至</div>
              <div>{{ formatDate(scope.row.validTo) || '-' }}</div>
            </div>
            <span v-else>-</span>
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
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              link 
              :icon="Edit" 
              :disabled="!hasPermission('edit', '编辑')"
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button 
              v-if="scope.row.status === 1"
              type="success" 
              link 
              :icon="CircleCheck" 
              :disabled="!hasPermission('enable', '启用')"
              @click="handleEnable(scope.row)"
            >
              启用
            </el-button>
            <el-button 
              v-else
              type="warning" 
              link 
              :icon="CircleClose" 
              :disabled="!hasPermission('disable', '禁用')"
              @click="handleDisable(scope.row)"
            >
              禁用
            </el-button>
            <el-button 
              type="danger" 
              link 
              :icon="Delete" 
              :disabled="!hasPermission('remove', '删除')"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
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
      width="800px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="租户编码" prop="tenantCode">
              <el-input v-model="formData.tenantCode" placeholder="请输入租户编码" :disabled="!!formData.id" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="租户名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入租户名称" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系人姓名" prop="contactName">
              <el-input v-model="formData.contactName" placeholder="请输入联系人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人手机号" prop="contactPhone">
              <el-input v-model="formData.contactPhone" placeholder="请输入联系人手机号" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系人邮箱" prop="contactEmail">
              <el-input v-model="formData.contactEmail" placeholder="请输入联系人邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="统一社会信用代码" prop="licenseNo">
              <el-input v-model="formData.licenseNo" placeholder="请输入统一社会信用代码" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="公司地址" prop="address">
          <el-input v-model="formData.address" placeholder="请输入公司地址" />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="行业" prop="industry">
              <el-input v-model="formData.industry" placeholder="请输入行业" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="企业规模" prop="scale">
              <el-input v-model="formData.scale" placeholder="请输入企业规模" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="有效期开始" prop="validFrom">
              <el-date-picker
                v-model="formData.validFrom"
                type="date"
                placeholder="选择有效期开始日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="有效期结束" prop="validTo">
              <el-date-picker
                v-model="formData.validTo"
                type="date"
                placeholder="选择有效期结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="0">启用</el-radio>
            <el-radio :label="1">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Edit, Delete, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import { getTenantList, getTenantById, addTenant, updateTenant, deleteTenant, enableTenant, disableTenant } from '@/api/tenant'
import { createPermissionChecker } from '@/utils/permission'
import { useMenuStore } from '@/stores/menu'

const menuStore = useMenuStore()

// 创建权限检查函数（基于当前页面路径）
const hasPermission = createPermissionChecker('/system/tenant')

// 搜索表单
const searchForm = reactive({
  name: '',
  tenantCode: '',
  contactName: '',
  contactPhone: '',
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
const dialogTitle = ref('新增租户')
const formRef = ref(null)
const submitting = ref(false)

// 表单数据
const formData = reactive({
  id: null,
  tenantCode: '',
  name: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  address: '',
  logo: '',
  licenseNo: '',
  industry: '',
  scale: '',
  validFrom: null,
  validTo: null,
  status: 0,
  remark: ''
})

// 表单验证规则
const formRules = {
  tenantCode: [
    { required: true, message: '请输入租户编码', trigger: 'blur' },
    { max: 64, message: '租户编码最大长度不能超过64', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入租户名称', trigger: 'blur' },
    { max: 128, message: '租户名称最大长度不能超过128', trigger: 'blur' }
  ],
  contactPhone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  contactEmail: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 获取租户列表
const fetchTenantList = async () => {
  loading.value = true
  try {
    const pageParams = {
      current: pagination.current,
      size: pagination.size
    }
    
    const queryData = {}
    if (searchForm.name) queryData.name = searchForm.name
    if (searchForm.tenantCode) queryData.tenantCode = searchForm.tenantCode
    if (searchForm.contactName) queryData.contactName = searchForm.contactName
    if (searchForm.contactPhone) queryData.contactPhone = searchForm.contactPhone
    if (searchForm.status !== null && searchForm.status !== undefined) {
      queryData.status = searchForm.status
    }

    console.log('调用租户列表接口:', { pageParams, queryData })
    const res = await getTenantList(pageParams, queryData)
    console.log('租户列表接口响应:', res)
    
    if (res.code === '200' && res.data) {
      tableData.value = res.data.records || []
      pagination.total = res.data.total || 0
      pagination.current = res.data.current || 1
      pagination.size = res.data.size || 10
    } else {
      ElMessage.error(res.message || '获取租户列表失败')
    }
  } catch (error) {
    console.error('获取租户列表失败:', error)
    const errorMessage = error.response?.data?.message || error.message || '获取租户列表失败'
    ElMessage.error(errorMessage)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchTenantList()
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.tenantCode = ''
  searchForm.contactName = ''
  searchForm.contactPhone = ''
  searchForm.status = null
  pagination.current = 1
  fetchTenantList()
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.current = 1
  fetchTenantList()
}

// 当前页改变
const handleCurrentChange = (current) => {
  pagination.current = current
  fetchTenantList()
}

// 格式化状态
const formatStatus = (status) => {
  return status === 0 ? '启用' : '禁用'
}

// 格式化日期（YYYY-MM-DD）
const formatDate = (dateString) => {
  if (!dateString) return '-'
  if (typeof dateString === 'string' && dateString.includes('T')) {
    return dateString.split('T')[0]
  }
  return dateString
}

// 格式化日期时间
const formatDateTime = (dateString) => {
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
  dialogTitle.value = '新增租户'
  Object.assign(formData, {
    id: null,
    tenantCode: '',
    name: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    address: '',
    logo: '',
    licenseNo: '',
    industry: '',
    scale: '',
    validFrom: null,
    validTo: null,
    status: 0,
    remark: ''
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = async (row) => {
  dialogTitle.value = '编辑租户'
  try {
    const res = await getTenantById(row.id)
    if (res.code === '200' && res.data) {
      Object.assign(formData, {
        id: res.data.id,
        tenantCode: res.data.tenantCode,
        name: res.data.name || '',
        contactName: res.data.contactName || '',
        contactPhone: res.data.contactPhone || '',
        contactEmail: res.data.contactEmail || '',
        address: res.data.address || '',
        logo: res.data.logo || '',
        licenseNo: res.data.licenseNo || '',
        industry: res.data.industry || '',
        scale: res.data.scale || '',
        validFrom: res.data.validFrom || null,
        validTo: res.data.validTo || null,
        status: res.data.status,
        remark: res.data.remark || ''
      })
      dialogVisible.value = true
    }
  } catch (error) {
    console.error('获取租户详情失败:', error)
    ElMessage.error('获取租户详情失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const submitData = { ...formData }
        
        if (submitData.id) {
          await updateTenant(submitData)
          ElMessage.success('更新成功')
        } else {
          await addTenant(submitData)
          ElMessage.success('新增成功，系统已自动创建默认管理员账号（admin/123456）')
        }
        
        dialogVisible.value = false
        fetchTenantList()
      } catch (error) {
        console.error('保存失败:', error)
      } finally {
        submitting.value = false
      }
    }
  })
}

// 启用
const handleEnable = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要启用租户 "${row.name}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await enableTenant(row.id)
    ElMessage.success('启用成功')
    fetchTenantList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('启用租户失败:', error)
    }
  }
}

// 禁用
const handleDisable = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要禁用租户 "${row.name}" 吗？禁用后该租户将无法登录系统。`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await disableTenant(row.id)
    ElMessage.success('禁用成功')
    fetchTenantList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('禁用租户失败:', error)
    }
  }
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除租户 "${row.name}" 吗？删除后将无法恢复，请谨慎操作！`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteTenant(row.id)
    ElMessage.success('删除成功')
    fetchTenantList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除租户失败:', error)
    }
  }
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

// 初始化
onMounted(() => {
  fetchTenantList()
})
</script>

<style scoped>
.tenant-page {
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

