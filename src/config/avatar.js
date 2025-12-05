/**
 * 头像配置
 */

// 默认头像地址
export const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'

// 其他可用的头像服务
export const avatarOptions = {
  // Element Plus 默认头像
  elementPlus: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
  
  // UI Avatars 服务（可以根据用户名生成头像）
  uiAvatars: (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=409eff&color=fff&size=128`,
  
  // DiceBear 服务（随机头像）
  diceBear: (seed) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed || 'default'}`,
  
  // Gravatar（需要邮箱）
  gravatar: (email) => `https://www.gravatar.com/avatar/${email}?d=identicon&s=128`,
  
  // 本地占位图
  placeholder: '/placeholder-avatar.png'
}

/**
 * 获取用户头像URL
 * @param {string} avatar - 用户头像URL
 * @param {string} fallback - 备用头像（用户名或邮箱）
 * @returns {string} 头像URL
 */
export function getUserAvatar(avatar, fallback = null) {
  if (avatar) {
    return avatar
  }
  
  if (fallback) {
    // 如果有用户名或邮箱，使用 UI Avatars 生成
    return avatarOptions.uiAvatars(fallback)
  }
  
  return defaultAvatar
}

