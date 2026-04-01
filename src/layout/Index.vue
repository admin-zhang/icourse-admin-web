<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '70px' : '210px'" class="layout-aside">
      <!-- Logo区域 -->
      <div class="logo-container">
        <div class="logo-wrapper" @click="$router.push('/dashboard')">
          <img 
            v-if="logoUrl" 
            :src="logoUrl" 
            :alt="logoAlt"
            class="logo-image"
            :class="{ 'logo-collapsed': isCollapse }"
          />
        </div>
        <div class="logo-text">
            <span v-if="!isCollapse" class="text-lg font-semibold text-white">颐暖 NuanCare</span>
        </div>
      </div>

      <nav class="flex-1 py-6 px-3">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        router
        class="layout-menu"
        background-color="#1e3a5f"
        text-color="#b3c4d6"
        active-text-color="#409eff"
      >
        <!-- 动态渲染菜单 -->
        <template v-if="filteredMenus.length > 0">
          <menu-item
            v-for="menu in filteredMenus"
            :key="menu.id"
            :menu="menu"
          />
        </template>
        <template v-else>
          <!-- 如果没有菜单数据，至少显示首页 -->
          <el-menu-item index="/dashboard">
            <el-icon><House /></el-icon>
            <template #title>首页</template>
          </el-menu-item>
        </template>
      </el-menu>
      </nav>

      <!-- 底部信息 -->
      <div class="border-t border-white">
        <div class="text-xs text-sidebar-foreground/60 text-center">
          © 2026 颐暖管理系统 v1.0
        </div>
      </div>

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
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { User, ArrowDown, Fold, Expand, House } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useMenuStore } from '@/stores/menu'
import MenuItem from '@/components/MenuItem.vue'
import { logoConfig } from '@/config/logo'

const route = useRoute()
const userStore = useUserStore()
const menuStore = useMenuStore()

const activeMenu = computed(() => route.path)

// Logo配置
const logoUrl = ref(logoConfig.url)
const logoAlt = ref(logoConfig.alt)

// 过滤后的菜单（只显示状态正常且可见的菜单）
const filteredMenus = computed(() => {
  const menus = menuStore.sidebarMenus || []
  
  // 如果没有菜单数据，至少返回首页菜单
  if (menus.length === 0) {
    return [{
      id: 0,
      menuName: '首页',
      parentId: 0,
      menuType: 'C',
      path: '/dashboard',
      component: 'Dashboard',
      icon: 'house',
      status: 0,
      visible: 0,
      children: []
    }]
  }
  
  const filtered = menus.filter(menu => {
    // 只显示状态正常（status === 0）且可见（visible === 0）的菜单
    // 首页菜单（id为0）始终显示
    if (menu.id === 0) {
      return true
    }
    return menu.status === 0 && menu.visible === 0
  })
  
  // 确保至少有一个菜单（首页）
  if (filtered.length === 0) {
    return [{
      id: 0,
      menuName: '首页',
      parentId: 0,
      menuType: 'C',
      path: '/dashboard',
      component: 'Dashboard',
      icon: 'house',
      status: 0,
      visible: 0,
      children: []
    }]
  }
  
  return filtered
})

// 组件挂载时恢复菜单数据
onMounted(() => {
  if (!menuStore.menuLoaded) {
    menuStore.restoreMenus()
  }
  
  // 如果已登录但菜单未加载，尝试加载菜单
  if (userStore.isLoggedIn && !menuStore.menuLoaded) {
    menuStore.fetchMenus().catch(error => {
      console.error('加载菜单失败:', error)
    })
  }
})

// 侧边栏收缩状态
const isCollapse = ref(false)

// 切换收缩状态
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 面包屑数据（根据菜单树动态生成）
const breadcrumbList = computed(() => {
  const breadcrumbs = []
  const currentPath = route.path
  
  // 查找当前路径对应的菜单
  const findMenuByPath = (menus, path, parents = []) => {
    for (const menu of menus) {
      const currentParents = [...parents, menu]
      
      if (menu.path === path) {
        return currentParents
      }
      
      if (menu.children && menu.children.length > 0) {
        const found = findMenuByPath(menu.children, path, currentParents)
        if (found) {
          return found
        }
      }
    }
    return null
  }
  
  const menuPath = findMenuByPath(menuStore.menuTree, currentPath)
  
  if (menuPath) {
    // 根据菜单树生成面包屑
    menuPath.forEach(menu => {
      if (menu.menuType === 'M' || menu.menuType === 'C') {
        breadcrumbs.push({
          title: menu.menuName,
          path: menu.path || '#'
        })
      }
    })
  } else {
    // 如果找不到菜单，使用路由的 meta 信息
    if (route.meta && route.meta.title) {
      breadcrumbs.push({
        title: route.meta.title,
        path: currentPath
      })
    }
  }
  
  return breadcrumbs
})

const handleCommand = async (command) => {
  if (command === 'profile') {
    router.push('/system/user/third-party-bind')
  } else if (command === 'logout') {
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
  background-color: var(--sidebar);
}

.layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 0 24px;
  height: 64px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  font-size: 20px;
  color: #64748b;
  padding: 8px;
}

.collapse-btn:hover {
  color: #334155;
  background: rgba(0, 0, 0, 0.05);
}

.system-title {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-wrapper {
  position: relative;
  width: 256px;
}

:root {
  --background: #f8fafc;
  --sidebar: #1e293b;
  --sidebar-foreground: #94a3b8;
  --card: #ffffff;
  --card-foreground: #0f172a;
  --primary: #3b82f6;
  --primary-foreground: #ffffff;
  --secondary: #e2e8f0;
  --secondary-foreground: #0f172a;
  --border: #e2e8f0;
  --muted: #f1f5f9;
  --muted-foreground: #64748b;
  --accent: #f1f5f9;
  --accent-foreground: #0f172a;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --ring: #3b82f6;
  --radius: 0.5rem;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #0f172a;
  background-color: var(--background);
}

/* 布局容器 */
.min-h-screen {
  min-height: 100vh;
}

.bg-background {
  background-color: var(--background);
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
  cursor: pointer;
  color: #333;
  gap: 5px;
}

.layout-aside {
  background: #1e3a5f;
  transition: width 0.3s;
  overflow: hidden;
  height: 100vh;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
}

/* Logo区域样式 */
.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0.625rem 0.75rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease-in-out;
  border-color: rgb(255 255 255 / 0.1);
}

.a:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.logo-text {
  margin-left: 0.1rem;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 1px;
  transition: all 0.3s;
}

.font-semibold {
  font-weight: 600;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.text-white {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.border-white {
  padding: 1rem;
  border-color: rgb(255 255 255 / 0.1);
}

.font-medium {
  font-weight: 500;
}

.transition-all {
  transition: all 0.2s ease-in-out;
}

.duration-200 {
  transition-duration: 200ms;
}

.hover\:bg-white\/5:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.group {
  position: relative;
}

.opacity-60 {
  opacity: 0.6;
}

.group\:hover\:opacity-100:hover {
  opacity: 1;
}

.transition-opacity {
  transition: opacity 0.2s ease-in-out;
}

/* 底部信息 */
.p-4 {
  padding: 1rem;
}

.border-t {
  border-top-width: 1px;
}

.text-xs {
  font-size: 0.75rem;
}

.text-sidebar-foreground\/60 {
  color: rgba(148, 163, 184, 0.6);
}

.text-center {
  text-align: center;
}

/* 主内容区域 */
.ml-64 {
  margin-left: 16rem;
}

.flex-1 {
  flex: 1;
}

/* 顶部导航栏 */
header {
  height: 4rem;
  background-color: var(--card);
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(8px);
  background-color: rgba(255, 255, 255, 0.8);
}

button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease-in-out;
}

button:hover {
  background-color: var(--muted);
}

.text-muted-foreground {
  color: var(--muted-foreground);
}

.text-foreground {
  color: var(--card-foreground);
}

/* 搜索框 */
.relative {
  position: relative;
}

.w-64 {
  width: 16rem;
}

.pl-9 {
  padding-left: 2.25rem;
}

.pr-4 {
  padding-right: 1rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.bg-muted\/50 {
  background-color: rgba(241, 245, 249, 0.5);
}

.border {
  border-width: 1px;
}

.border-border {
  border-color: var(--border);
}

.rounded-lg {
  border-radius: 0.5rem;
}

.text-sm {
  font-size: 0.875rem;
}

.focus\:outline-none:focus {
  outline: none;
}

.focus\:ring-2:focus {
  ring-width: 2px;
}

.focus\:ring-primary\/20:focus {
  ring-color: rgba(59, 130, 246, 0.2);
}

.focus\:border-primary:focus {
  border-color: var(--primary);
}

/* 通知按钮 */
.relative {
  position: relative;
}

.w-2 {
  width: 0.5rem;
}

.h-2 {
  height: 0.5rem;
}

.bg-red-500 {
  background-color: #ef4444;
}

.rounded-full {
  border-radius: 9999px;
}

.absolute {
  position: absolute;
}

.top-1\.5 {
  top: 0.375rem;
}

.right-1\.5 {
  right: 0.375rem;
}

/* 用户信息 */
.pl-4 {
  padding-left: 1rem;
}

.border-l {
  border-left-width: 1px;
}

.w-9 {
  width: 2.25rem;
}

.h-9 {
  height: 2.25rem;
}

.bg-gradient-to-br {
  background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
}

.from-blue-400 {
  --tw-gradient-from: #60a5fa;
  --tw-gradient-to: rgba(96, 165, 250, 0);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.to-blue-600 {
  --tw-gradient-to: #2563eb;
}

.justify-center {
  justify-content: center;
}

.logo-image {
  max-width: 100%;
  max-height: 40px;
  height: auto;
  object-fit: contain;
  transition: all 0.3s;
}

.hover\:bg-muted\/50:hover {
  background-color: rgba(241, 245, 249, 0.5);
}

.layout-menu {
  border-right: none;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.md\:grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.lg\:grid-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.gap-6 {
  gap: 1.5rem;
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

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.border {
  border-width: 1px;
}

.border-border\/50 {
  border-color: rgba(226, 232, 240, 0.5);
}

.hover\:shadow-md:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* 卡片内容 */
.items-start {
  align-items: flex-start;
}

.mb-1 {
  margin-bottom: 0.25rem;
}

.text-muted-foreground {
  color: var(--muted-foreground);
}

.items-baseline {
  align-items: baseline;
}

.gap-2 {
  gap: 0.5rem;
}

.text-2xl {
  font-size: 1.5rem;
}

.font-bold {
  font-weight: 700;
}

.text-foreground {
  color: var(--card-foreground);
}

.text-xs {
  font-size: 0.75rem;
}

.text-green-600 {
  color: #10b981;
}

.bg-green-50 {
  background-color: #ecfdf5;
}

.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.py-0\.5 {
  padding-top: 0.125rem;
  padding-bottom: 0.125rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.w-12 {
  width: 3rem;
}

.h-12 {
  height: 3rem;
}

.bg-blue-50 {
  background-color: #eff6ff;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.text-blue-500 {
  color: #3b82f6;
}

.bg-green-50 {
  background-color: #ecfdf5;
}

.text-green-500 {
  color: #10b981;
}

.bg-purple-50 {
  background-color: #f5f3ff;
}

.text-purple-500 {
  color: #8b5cf6;
}

.bg-orange-50 {
  background-color: #fff7ed;
}

.text-orange-500 {
  color: #f97316;
}

.text-red-600 {
  color: #ef4444;
}

.bg-red-50 {
  background-color: #fef2f2;
}

/* 欢迎卡片 */
.p-8 {
  padding: 2rem;
}

.max-w-2xl {
  max-width: 32rem;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.text-center {
  text-align: center;
}

.w-16 {
  width: 4rem;
}

.h-16 {
  height: 4rem;
}

.from-orange-400 {
  --tw-gradient-from: #fb923c;
  --tw-gradient-to: rgba(251, 146, 60, 0);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.to-orange-600 {
  --tw-gradient-to: #ea580c;
}

.rounded-2xl {
  border-radius: 1rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.text-2xl {
  font-size: 1.5rem;
}

.font-bold {
  font-weight: 700;
}

.text-foreground {
  color: var(--card-foreground);
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.px-6 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.py-2\.5 {
  padding-top: 0.625rem;
  padding-bottom: 0.625rem;
}

.bg-primary {
  background-color: var(--primary);
}

.text-primary-foreground {
  color: var(--primary-foreground);
}

.hover\:bg-primary\/90:hover {
  background-color: rgba(59, 130, 246, 0.9);
}

.bg-secondary {
  background-color: var(--secondary);
}

.text-secondary-foreground {
  color: var(--secondary-foreground);
}

.hover\:bg-secondary\/90:hover {
  background-color: rgba(226, 232, 240, 0.9);
}

/* 额外信息提示 */
.mt-6 {
  margin-top: 1.5rem;
}

.p-4 {
  padding: 1rem;
}

.bg-blue-50 {
  background-color: #eff6ff;
}

.border {
  border-width: 1px;
}

.border-blue-200 {
  border-color: #bfdbfe;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.text-sm {
  font-size: 0.875rem;
}

.text-blue-800 {
  color: #1e40af;
}

.font-semibold {
  font-weight: 600;
}

/* 响应式设计 */
@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
