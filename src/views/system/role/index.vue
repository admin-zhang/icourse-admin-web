<template>
  <div class="role-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button 
            type="primary" 
            :icon="Plus" 
            :disabled="!hasPermission('add', '新增')"
            @click="handleAdd"
          >
            新增角色
          </el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="角色名称">
          <el-input v-model="searchForm.roleName" placeholder="请输入角色名称" clearable @clear="handleSearch" style="width: 180px" />
        </el-form-item>
        <el-form-item label="角色标识">
          <el-input v-model="searchForm.roleKey" placeholder="请输入角色标识" clearable @clear="handleSearch" style="width: 180px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable @clear="handleSearch" style="width: 150px">
            <el-option label="正常" :value="0" />
            <el-option label="停用" :value="1" />
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
        <el-table-column prop="roleName" label="角色名称" width="150" />
        <el-table-column prop="roleKey" label="角色标识" width="150" />
        <el-table-column prop="roleSort" label="显示顺序" width="100" />
        <el-table-column prop="dataScope" label="数据范围" width="120">
          <template #default="scope">
            {{ formatDataScope(scope.row.dataScope) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">
              {{ formatStatus(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
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
              type="warning" 
              link 
              :icon="Setting" 
              :disabled="!hasPermission('assign', '分配')"
              @click="handleAssignMenu(scope.row)"
            >
              分配菜单
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
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="formData.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色标识" prop="roleKey">
          <el-input v-model="formData.roleKey" placeholder="请输入角色标识" />
        </el-form-item>
        <el-form-item label="显示顺序" prop="roleSort">
          <el-input-number v-model="formData.roleSort" :min="0" />
        </el-form-item>
        <el-form-item label="数据范围" prop="dataScope">
          <el-select v-model="formData.dataScope" placeholder="请选择数据范围">
            <el-option label="全部数据权限" value="1" />
            <el-option label="自定义数据权限" value="2" />
            <el-option label="本部门数据权限" value="3" />
            <el-option label="本部门及以下数据权限" value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="0">正常</el-radio>
            <el-radio :label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 分配菜单对话框 -->
    <el-dialog
      v-model="menuDialogVisible"
      title="分配菜单权限"
      width="600px"
    >
      <el-tree
        ref="menuTreeRef"
        :data="menuTreeData"
        :props="{ children: 'children', label: 'menuName' }"
        show-checkbox
        node-key="id"
        :default-checked-keys="checkedMenuKeys"
      />
      <template #footer>
        <el-button @click="menuDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleMenuSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Edit, Delete, Setting } from '@element-plus/icons-vue'
import { getRoleList, getRoleById, addRole, updateRole, deleteRole, assignRole } from '@/api/role'
import { getMenuTreeSimple } from '@/api/menu'
import { createPermissionChecker } from '@/utils/permission'

// 创建权限检查函数（基于当前页面路径）
const hasPermission = createPermissionChecker('/system/role')

// 搜索表单
const searchForm = reactive({
  roleName: '',
  roleKey: '',
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
const menuDialogVisible = ref(false)
const dialogTitle = ref('新增角色')
const formRef = ref(null)
const menuTreeRef = ref(null)

// 表单数据
const formData = reactive({
  id: null,
  roleName: '',
  roleKey: '',
  roleSort: 0,
  dataScope: '1',
  status: 0,
  remark: ''
})

// 菜单树数据
const menuTreeData = ref([])
const checkedMenuKeys = ref([])
const currentRoleId = ref(null)

// 表单验证规则
const formRules = {
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { max: 50, message: '角色名称最大长度要小于50', trigger: 'blur' }
  ],
  roleKey: [
    { required: true, message: '请输入角色标识', trigger: 'blur' },
    { max: 100, message: '角色标识最大长度要小于100', trigger: 'blur' }
  ]
}

// 获取角色列表
const fetchRoleList = async () => {
  loading.value = true
  try {
    const pageParams = {
      current: pagination.current,
      size: pagination.size
    }
    
    const queryData = {}
    if (searchForm.roleName) queryData.roleName = searchForm.roleName
    if (searchForm.roleKey) queryData.roleKey = searchForm.roleKey
    if (searchForm.status !== null && searchForm.status !== undefined) {
      queryData.status = searchForm.status
    }

    const res = await getRoleList(pageParams, queryData)
    if (res.code === '200' && res.data) {
      tableData.value = res.data.records || []
      pagination.total = res.data.total || 0
      pagination.current = res.data.current || 1
      pagination.size = res.data.size || 10
    }
  } catch (error) {
    console.error('获取角色列表失败:', error)
    ElMessage.error('获取角色列表失败')
  } finally {
    loading.value = false
  }
}

// 获取菜单树
const fetchMenuTree = async () => {
  try {
    const res = await getMenuTreeSimple()
    if (res.code === '200' && res.data) {
      menuTreeData.value = res.data
    }
  } catch (error) {
    console.error('获取菜单树失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchRoleList()
}

// 重置
const handleReset = () => {
  searchForm.roleName = ''
  searchForm.roleKey = ''
  searchForm.status = null
  pagination.current = 1
  fetchRoleList()
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.current = 1
  fetchRoleList()
}

// 当前页改变
const handleCurrentChange = (current) => {
  pagination.current = current
  fetchRoleList()
}

// 格式化数据范围
const formatDataScope = (dataScope) => {
  const scopeMap = {
    '1': '全部数据权限',
    '2': '自定义数据权限',
    '3': '本部门数据权限',
    '4': '本部门及以下数据权限'
  }
  return scopeMap[dataScope] || '全部数据权限'
}

// 格式化状态
const formatStatus = (status) => {
  return status === 0 ? '正常' : '停用'
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
  dialogTitle.value = '新增角色'
  Object.assign(formData, {
    id: null,
    roleName: '',
    roleKey: '',
    roleSort: 0,
    dataScope: '1',
    status: 0,
    remark: ''
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = async (row) => {
  dialogTitle.value = '编辑角色'
  try {
    const res = await getRoleById(row.id)
    if (res.code === '200' && res.data) {
      Object.assign(formData, {
        id: res.data.id,
        roleName: res.data.roleName,
        roleKey: res.data.roleKey,
        roleSort: res.data.roleSort || 0,
        dataScope: res.data.dataScope || '1',
        status: res.data.status,
        remark: res.data.remark || ''
      })
      dialogVisible.value = true
    }
  } catch (error) {
    console.error('获取角色详情失败:', error)
    ElMessage.error('获取角色详情失败')
  }
}

// 分配菜单
const handleAssignMenu = async (row) => {
  currentRoleId.value = row.id
  checkedMenuKeys.value = []
  
  try {
    const res = await getRoleById(row.id)
    if (res.code === '200' && res.data && res.data.menuIds) {
      checkedMenuKeys.value = res.data.menuIds
    }
    menuDialogVisible.value = true
    
    // 等待DOM更新后设置选中状态
    await nextTick()
    if (menuTreeRef.value) {
      menuTreeRef.value.setCheckedKeys(checkedMenuKeys.value)
    }
  } catch (error) {
    console.error('获取角色菜单失败:', error)
    menuDialogVisible.value = true
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (formData.id) {
          await updateRole(formData)
          ElMessage.success('更新成功')
        } else {
          await addRole(formData)
          ElMessage.success('新增成功')
        }
        
        dialogVisible.value = false
        fetchRoleList()
      } catch (error) {
        console.error('保存失败:', error)
      }
    }
  })
}

// 提交菜单分配
const handleMenuSubmit = async () => {
  if (!menuTreeRef.value) return
  
  // 获取所有选中的节点（包括半选状态的父节点）
  const checkedKeys = menuTreeRef.value.getCheckedKeys()
  const halfCheckedKeys = menuTreeRef.value.getHalfCheckedKeys()
  
  // 合并选中的节点和半选状态的父节点
  // 半选状态的父节点表示部分子节点被选中，也需要包含在权限中
  const menuIds = [...new Set([...checkedKeys, ...halfCheckedKeys])]
  
  try {
    // 获取当前角色的基本信息
    const roleRes = await getRoleById(currentRoleId.value)
    if (roleRes.code !== '200' || !roleRes.data) {
      ElMessage.error('获取角色信息失败')
      return
    }
    
    // 更新角色信息，包括菜单权限
    await updateRole({
      id: roleRes.data.id,
      roleName: roleRes.data.roleName,
      roleKey: roleRes.data.roleKey,
      roleSort: roleRes.data.roleSort || 0,
      dataScope: roleRes.data.dataScope || '1',
      status: roleRes.data.status,
      remark: roleRes.data.remark || '',
      menuIds: menuIds
    })
    ElMessage.success('分配菜单成功')
    menuDialogVisible.value = false
    fetchRoleList()
  } catch (error) {
    console.error('分配菜单失败:', error)
    ElMessage.error('分配菜单失败')
  }
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色 "${row.roleName}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteRole(row.id)
    ElMessage.success('删除成功')
    fetchRoleList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除角色失败:', error)
    }
  }
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

// 初始化
onMounted(() => {
  fetchRoleList()
  fetchMenuTree()
})
</script>

<style scoped>
.role-page {
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

