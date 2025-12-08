<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '200px'" class="layout-aside">
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
          <span v-else class="logo-text" :class="{ 'logo-text-collapsed': isCollapse }">
            <span v-if="!isCollapse">iCourse</span>
            <span v-else>iC</span>
          </span>
        </div>
      </div>
      
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
  justify-content: center;
  padding: 0 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

.logo-wrapper {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  transition: all 0.3s;
}

.logo-wrapper:hover {
  opacity: 0.8;
}

.logo-image {
  max-width: 100%;
  max-height: 40px;
  height: auto;
  object-fit: contain;
  transition: all 0.3s;
}

.logo-image.logo-collapsed {
  max-height: 32px;
}

.logo-text {
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 1px;
  transition: all 0.3s;
}

.logo-text-collapsed {
  font-size: 16px;
}

.layout-menu {
  border-right: none;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
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
