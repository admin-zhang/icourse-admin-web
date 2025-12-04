<template>
  <!-- 目录类型 (M) - 显示为子菜单 -->
  <el-sub-menu
    v-if="menu.menuType === 'M'"
    :index="String(menu.id)"
  >
    <template #title>
      <el-icon v-if="menu.icon">
        <component :is="getIcon(menu.icon)" />
      </el-icon>
      <span>{{ menu.menuName }}</span>
    </template>
    <!-- 递归渲染子菜单 -->
    <menu-item
      v-for="child in menu.children"
      :key="child.id"
      :menu="child"
    />
  </el-sub-menu>

  <!-- 菜单类型 (C) - 显示为菜单项 -->
  <el-menu-item
    v-else-if="menu.menuType === 'C' && menu.path"
    :index="menu.path.startsWith('/') ? menu.path : `/${menu.path}`"
  >
    <el-icon v-if="menu.icon">
      <component :is="getIcon(menu.icon)" />
    </el-icon>
    <template #title>{{ menu.menuName }}</template>
  </el-menu-item>
</template>

<script setup>
import { 
  House, UserFilled, Reading, ShoppingCart, 
  Setting, Monitor, Document, Menu as MenuIcon,
  Tools, Grid, List, Files, Folder, 
  Operation, Connection, DataAnalysis
} from '@element-plus/icons-vue'

const props = defineProps({
  menu: {
    type: Object,
    required: true
  }
})

/**
 * 根据图标名称获取图标组件
 * @param {string} iconName - 图标名称
 * @returns {Component}
 */
const getIcon = (iconName) => {
  if (!iconName) {
    return MenuIcon
  }
  
  // 图标名称映射（支持多种命名方式）
  const iconMap = {
    // 系统相关
    'system': Setting,
    'setting': Setting,
    'tools': Tools,
    
    // 用户相关
    'user': UserFilled,
    'users': UserFilled,
    'peoples': UserFilled,
    'people': UserFilled,
    
    // 菜单相关
    'tree': MenuIcon,
    'menu': MenuIcon,
    'list': List,
    'grid': Grid,
    
    // 监控相关
    'monitor': Monitor,
    'monitoring': Monitor,
    
    // 日志相关
    'log': Document,
    'logs': Document,
    'document': Document,
    'files': Files,
    
    // 其他
    'house': House,
    'home': House,
    'reading': Reading,
    'book': Reading,
    'shopping-cart': ShoppingCart,
    'cart': ShoppingCart,
    'folder': Folder,
    'operation': Operation,
    'connection': Connection,
    'data-analysis': DataAnalysis
  }
  
  // 转换为小写进行匹配
  const lowerIconName = iconName.toLowerCase()
  
  // 如果找不到对应的图标，返回默认图标
  return iconMap[lowerIconName] || MenuIcon
}
</script>

