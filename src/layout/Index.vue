<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '200px'" class="layout-aside">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        router
        class="layout-menu"
        background-color="#1e3a5f"
        text-color="#b3c4d6"
        active-text-color="#409eff"
      >
        <el-menu-item index="/dashboard">
          <el-icon><House /></el-icon>
          <template #title>首页</template>
        </el-menu-item>
        <el-menu-item index="/user">
          <el-icon><UserFilled /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>
        <el-sub-menu index="course-management">
          <template #title>
            <el-icon><Reading /></el-icon>
            <span>课程管理</span>
          </template>
          <el-menu-item index="/course">课程列表</el-menu-item>
          <el-menu-item index="/course/category">课程分类</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="order-management">
          <template #title>
            <el-icon><ShoppingCart /></el-icon>
            <span>订单管理</span>
          </template>
          <el-menu-item index="/order">订单列表</el-menu-item>
          <el-menu-item index="/order/refund">退款管理</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="layout-header">
        <div class="header-left">
          <el-button
            :icon="isCollapse ? Expand : Fold"
            @click="toggleCollapse"
            class="collapse-btn"
            text
          />
          <el-breadcrumb separator="/">
            <el-breadcrumb-item
              v-for="(item, index) in breadcrumbList"
              :key="index"
              :to="item.path"
            >
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-icon><User /></el-icon>
              <span>{{ userStore.nickName || userStore.username }}</span>
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { User, ArrowDown, House, Reading, UserFilled, ShoppingCart, Fold, Expand } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)

// 侧边栏收缩状态
const isCollapse = ref(false)

// 切换收缩状态
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 面包屑数据
const breadcrumbList = computed(() => {
  const breadcrumbs = []
  
  // 添加首页
  breadcrumbs.push({
    title: '首页',
    path: '/dashboard'
  })
  
  // 获取当前路由路径
  const currentPath = route.path
  
  // 根据路径判断父级菜单
  if (currentPath.startsWith('/course')) {
    breadcrumbs.push({
      title: '课程管理',
      path: '/course'
    })
  } else if (currentPath.startsWith('/order')) {
    breadcrumbs.push({
      title: '订单管理',
      path: '/order'
    })
  }
  
  // 添加当前页面标题
  if (route.meta && route.meta.title) {
    const currentTitle = route.meta.title
    // 如果当前标题不是父级菜单标题，则添加
    const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1]
    if (!lastBreadcrumb || lastBreadcrumb.title !== currentTitle) {
      breadcrumbs.push({
        title: currentTitle,
        path: currentPath
      })
    }
  }
  
  return breadcrumbs
})

const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await userStore.logout()
    } catch (error) {
      // 用户取消
    }
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.collapse-btn {
  font-size: 18px;
  color: #606266;
}

.collapse-btn:hover {
  color: #409eff;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #333;
  gap: 5px;
}

.layout-aside {
  background: #1e3a5f;
  transition: width 0.3s;
  overflow: hidden;
}

.layout-menu {
  border-right: none;
  height: 100%;
}

/* 侧边栏菜单样式 */
:deep(.el-menu) {
  background-color: #1e3a5f !important;
}

:deep(.el-menu-item) {
  color: #b3c4d6 !important;
  border-left: 3px solid transparent;
}

:deep(.el-menu-item:hover) {
  background-color: #2a4a6f !important;
  color: #fff !important;
}

:deep(.el-menu-item.is-active) {
  background-color: rgba(64, 158, 255, 0.2) !important;
  color: #409eff !important;
  border-left-color: #409eff !important;
}

:deep(.el-sub-menu__title) {
  color: #b3c4d6 !important;
}

:deep(.el-sub-menu__title:hover) {
  background-color: #2a4a6f !important;
  color: #fff !important;
}

:deep(.el-sub-menu.is-opened > .el-sub-menu__title) {
  color: #409eff !important;
}

:deep(.el-menu--collapse .el-sub-menu__title) {
  padding: 0 20px !important;
}

/* 子菜单样式 */
:deep(.el-sub-menu .el-menu-item) {
  background-color: #162d47 !important;
  padding-left: 50px !important;
}

:deep(.el-sub-menu .el-menu-item:hover) {
  background-color: #2a4a6f !important;
}

:deep(.el-sub-menu .el-menu-item.is-active) {
  background-color: rgba(64, 158, 255, 0.2) !important;
  color: #409eff !important;
  border-left-color: #409eff !important;
}

.layout-main {
  background: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
}
</style>
