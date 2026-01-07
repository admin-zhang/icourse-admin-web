import JSEncrypt from 'jsencrypt'

/**
 * RSA加密工具类
 */
class RsaUtil {
  constructor() {
    this.publicKey = null
    this.encrypt = null
  }

  /**
   * 设置公钥
   * @param {string} publicKey - PEM格式的公钥（包含-----BEGIN PUBLIC KEY-----和-----END PUBLIC KEY-----）
   */
  setPublicKey(publicKey) {
    this.publicKey = publicKey
    this.encrypt = new JSEncrypt()
    // 如果已经是PEM格式，直接使用；否则添加头尾标识
    if (publicKey.includes('BEGIN PUBLIC KEY')) {
      this.encrypt.setPublicKey(publicKey)
    } else {
      // 如果不是PEM格式，添加头尾标识
      const pemPublicKey = `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`
      this.encrypt.setPublicKey(pemPublicKey)
    }
  }

  /**
   * 加密数据
   * @param {string} data - 要加密的数据
   * @returns {string} Base64编码的加密数据
   */
  encryptData(data) {
    if (!this.encrypt || !this.publicKey) {
      throw new Error('公钥未设置，请先调用setPublicKey方法')
    }
    
    const encrypted = this.encrypt.encrypt(data)
    if (!encrypted) {
      throw new Error('加密失败，请检查公钥是否正确')
    }
    
    return encrypted
  }

  /**
   * 检查公钥是否已设置
   * @returns {boolean}
   */
  isPublicKeySet() {
    return this.publicKey !== null && this.encrypt !== null
  }
}

// 导出单例
export default new RsaUtil()


