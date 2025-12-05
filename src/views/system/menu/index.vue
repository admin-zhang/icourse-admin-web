<template>
  <div class="menu-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>菜单管理</span>
          <el-button 
            type="primary" 
            :icon="Plus" 
            :disabled="!hasPermission('add', '新增')"
            @click="handleAdd"
          >
            新增菜单
          </el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="菜单名称">
          <el-input v-model="searchForm.menuName" placeholder="请输入菜单名称" clearable @clear="handleSearch" style="width: 180px" />
        </el-form-item>
        <el-form-item label="菜单类型">
          <el-select v-model="searchForm.menuType" placeholder="请选择菜单类型" clearable @clear="handleSearch" style="width: 150px">
            <el-option label="目录" value="M" />
            <el-option label="菜单" value="C" />
            <el-option label="按钮" value="F" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable @clear="handleSearch" style="width: 150px">
            <el-option label="正常" :value="0" />
            <el-option label="异常" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 树形表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        border
        stripe
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="true"
      >
        <el-table-column prop="menuName" label="菜单名称" width="200" />
        <el-table-column prop="icon" label="图标" width="100">
          <template #default="scope">
            <el-icon v-if="scope.row.icon">
              <component :is="getIcon(scope.row.icon)" />
            </el-icon>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="path" label="路由地址" width="200" show-overflow-tooltip />
        <el-table-column prop="component" label="组件路径" min-width="200" show-overflow-tooltip />
        <el-table-column prop="menuType" label="类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.menuType === 'M' ? 'primary' : scope.row.menuType === 'C' ? 'success' : 'info'">
              {{ formatMenuType(scope.row.menuType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="perms" label="权限标识" min-width="200" show-overflow-tooltip />
        <el-table-column prop="visible" label="是否隐藏" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.visible === 0 ? 'success' : 'danger'">
              {{ scope.row.visible === 0 ? '显示' : '隐藏' }}
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
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              link 
              :icon="Plus" 
              :disabled="!hasPermission('add', '新增')"
              @click="handleAddChild(scope.row)"
            >
              新增
            </el-button>
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
        <el-form-item label="上级菜单" prop="parentId">
          <el-select
            v-model="formData.parentId"
            placeholder="请选择上级菜单"
            style="width: 100%"
            clearable
          >
            <el-option label="主类目" :value="0" />
            <template v-for="menu in menuTreeOptions" :key="menu.id">
              <el-option :label="menu.menuName" :value="menu.id" />
              <template v-if="menu.children && menu.children.length > 0">
                <el-option
                  v-for="child in menu.children"
                  :key="child.id"
                  :label="'  └─ ' + child.menuName"
                  :value="child.id"
                />
              </template>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="菜单类型" prop="menuType">
          <el-radio-group v-model="formData.menuType">
            <el-radio label="M">目录</el-radio>
            <el-radio label="C">菜单</el-radio>
            <el-radio label="F">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="formData.menuName" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item v-if="formData.menuType !== 'F'" label="路由地址" prop="path">
          <el-input v-model="formData.path" placeholder="请输入路由地址" />
        </el-form-item>
        <el-form-item v-if="formData.menuType === 'C'" label="组件路径" prop="component">
          <el-input v-model="formData.component" placeholder="请输入组件路径，如：system/user/index" />
        </el-form-item>
        <el-form-item v-if="formData.menuType !== 'F'" label="图标" prop="icon">
          <el-input v-model="formData.icon" placeholder="请输入图标名称" />
        </el-form-item>
        <el-form-item label="显示顺序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" />
        </el-form-item>
        <el-form-item label="权限标识" prop="perms">
          <el-input v-model="formData.perms" placeholder="请输入权限标识" />
        </el-form-item>
        <el-form-item v-if="formData.menuType !== 'F'" label="是否隐藏" prop="visible">
          <el-radio-group v-model="formData.visible">
            <el-radio :label="0">显示</el-radio>
            <el-radio :label="1">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="0">正常</el-radio>
            <el-radio :label="1">异常</el-radio>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Edit, Delete, Setting, Menu as MenuIcon } from '@element-plus/icons-vue'
import { getMenuList, getMenuTreeSimple, getMenuById, addMenu, updateMenu, deleteMenu } from '@/api/menu'
import { createPermissionChecker } from '@/utils/permission'

// 创建权限检查函数（基于当前页面路径）
const hasPermission = createPermissionChecker('/system/menu')

// 搜索表单
const searchForm = reactive({
  menuName: '',
  menuType: null,
  status: null
})

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('新增菜单')
const formRef = ref(null)

// 表单数据
const formData = reactive({
  id: null,
  menuName: '',
  parentId: 0,
  sort: 0,
  icon: '',
  path: '',
  component: '',
  menuType: 'C',
  perms: '',
  visible: 0,
  status: 0,
  remark: ''
})

// 菜单树选项（用于选择上级菜单）
const menuTreeOptions = ref([])

// 表单验证规则
const formRules = {
  menuName: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' },
    { max: 50, message: '菜单名称最大长度要小于50', trigger: 'blur' }
  ],
  parentId: [
    { required: true, message: '请选择上级菜单', trigger: 'change' }
  ],
  menuType: [
    { required: true, message: '请选择菜单类型', trigger: 'change' }
  ]
}

// 获取图标组件
const getIcon = (iconName) => {
  if (!iconName) return MenuIcon
  const iconMap = {
    'system': Setting,
    'user': MenuIcon,
    'tree': MenuIcon,
    'monitor': MenuIcon,
    'log': MenuIcon
  }
  return iconMap[iconName.toLowerCase()] || MenuIcon
}

// 获取菜单列表
const fetchMenuList = async () => {
  loading.value = true
  try {
    const pageParams = {
      current: 1,
      size: 10 // 获取所有菜单
    }
    
    const queryData = {}
    if (searchForm.menuName) queryData.menuName = searchForm.menuName
    if (searchForm.menuType) queryData.menuType = searchForm.menuType
    if (searchForm.status !== null && searchForm.status !== undefined) {
      queryData.status = searchForm.status
    }

    const res = await getMenuTreeSimple({})
    if (res.code === '200' && res.data) {
      tableData.value = res.data
    }
  } catch (error) {
    console.error('获取菜单列表失败:', error)
    ElMessage.error('获取菜单列表失败')
  } finally {
    loading.value = false
  }
}

// 获取菜单树（用于选择上级菜单）
const fetchMenuTreeOptions = async () => {
  try {
    const res = await getMenuTreeSimple()
    if (res.code === '200' && res.data) {
      // 扁平化菜单树，用于下拉选择
      const flattenMenus = (menus) => {
        const result = []
        menus.forEach(menu => {
          if (menu.menuType === 'M' || menu.menuType === 'C') {
            result.push({
              id: menu.id,
              menuName: menu.menuName,
              children: menu.children ? flattenMenus(menu.children) : []
            })
          }
        })
        return result
      }
      menuTreeOptions.value = flattenMenus(res.data)
    }
  } catch (error) {
    console.error('获取菜单树失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  fetchMenuList()
}

// 重置
const handleReset = () => {
  searchForm.menuName = ''
  searchForm.menuType = null
  searchForm.status = null
  fetchMenuList()
}

// 格式化菜单类型
const formatMenuType = (type) => {
  const typeMap = {
    'M': '目录',
    'C': '菜单',
    'F': '按钮'
  }
  return typeMap[type] || type
}

// 格式化状态
const formatStatus = (status) => {
  return status === 0 ? '正常' : '异常'
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增菜单'
  Object.assign(formData, {
    id: null,
    menuName: '',
    parentId: 0,
    sort: 0,
    icon: '',
    path: '',
    component: '',
    menuType: 'C',
    perms: '',
    visible: 0,
    status: 0,
    remark: ''
  })
  dialogVisible.value = true
}

// 新增子菜单
const handleAddChild = (row) => {
  dialogTitle.value = '新增子菜单'
  Object.assign(formData, {
    id: null,
    menuName: '',
    parentId: row.id,
    sort: 0,
    icon: '',
    path: '',
    component: '',
    menuType: 'C',
    perms: '',
    visible: 0,
    status: 0,
    remark: ''
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = async (row) => {
  dialogTitle.value = '编辑菜单'
  try {
    const res = await getMenuById(row.id)
    if (res.code === '200' && res.data) {
      Object.assign(formData, {
        id: res.data.id,
        menuName: res.data.menuName,
        parentId: res.data.parentId || 0,
        sort: res.data.sort || 0,
        icon: res.data.icon || '',
        path: res.data.path || '',
        component: res.data.component || '',
        menuType: res.data.menuType,
        perms: res.data.perms || '',
        visible: res.data.visible !== undefined ? res.data.visible : 0,
        status: res.data.status,
        remark: res.data.remark || ''
      })
      dialogVisible.value = true
    }
  } catch (error) {
    console.error('获取菜单详情失败:', error)
    ElMessage.error('获取菜单详情失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const submitData = { ...formData }
        if (submitData.id) {
          await updateMenu(submitData)
          ElMessage.success('更新成功')
        } else {
          await addMenu(submitData)
          ElMessage.success('新增成功')
        }
        
        dialogVisible.value = false
        fetchMenuList()
        fetchMenuTreeOptions()
      } catch (error) {
        console.error('保存失败:', error)
      }
    }
  })
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除菜单 "${row.menuName}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteMenu(row.id)
    ElMessage.success('删除成功')
    fetchMenuList()
    fetchMenuTreeOptions()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除菜单失败:', error)
    }
  }
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

// 初始化
onMounted(() => {
  fetchMenuList()
  fetchMenuTreeOptions()
})
</script>

<style scoped>
.menu-page {
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
</style>

