import request from '@/utils/request'

/**
 * 获取服务器信息
 * @returns {Promise} 返回 ServerInfoVO
 */
export function getServerInfo() {
  return request({
    url: '/sms/monitor/server',
    method: 'get'
  })
}

/**
 * 获取JVM信息
 * @returns {Promise} 返回 JvmInfoVO
 */
export function getJvmInfo() {
  return request({
    url: '/sms/monitor/jvm',
    method: 'get'
  })
}

/**
 * 获取Redis信息
 * @returns {Promise} 返回 RedisInfoVO
 */
export function getRedisInfo() {
  return request({
    url: '/sms/monitor/redis',
    method: 'get'
  })
}

/**
 * 获取在线用户列表
 * @returns {Promise} 返回在线用户列表 List<OnlineUserVO>
 */
export function getOnlineUsers() {
  return request({
    url: '/sms/monitor/online',
    method: 'get'
  })
}

/**
 * 获取综合监控信息
 * @returns {Promise} 返回 MonitorInfoVO
 */
export function getMonitorInfo() {
  return request({
    url: '/sms/monitor/info',
    method: 'get'
  })
}

/**
 * 强制下线用户
 * @param {string} token - 用户Token
 * @returns {Promise} 返回 Boolean
 */
export function forceLogout(token) {
  return request({
    url: `/sms/monitor/online/${token}`,
    method: 'delete'
  })
}


