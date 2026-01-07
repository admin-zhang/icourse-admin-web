/**
 * Logo配置
 * 可以在这里配置企业logo，也可以从后端API获取
 */

export const logoConfig = {
  // Logo图片URL（支持相对路径和绝对路径）
  // 相对路径示例：'/logo.png'（放在public目录下）
  // 绝对路径示例：'https://example.com/logo.png'
  url: '', // 如果为空，则显示文字logo
  
  // Logo的alt文本
  alt: 'iCourse',
  
  // 侧边栏Logo配置
  sidebar: {
    // 侧边栏展开时的最大高度（px）
    maxHeight: 40,
    // 侧边栏收缩时的最大高度（px）
    collapsedMaxHeight: 32
  },
  
  // 登录页Logo配置
  login: {
    // 登录页Logo的最大宽度（px）
    maxWidth: 120,
    // 登录页Logo的最大高度（px）
    maxHeight: 60
  }
}


