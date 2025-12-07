<template>
  <div class="watermark-standalone">
    <div class="header">
      <h1>图片水印工具</h1>
      <p class="subtitle">免费在线图片水印处理工具，无需登录即可使用</p>
    </div>

    <div class="watermark-container">
      <!-- 左侧：图片上传和预览 -->
      <div class="upload-section">
        <el-upload
          class="upload-demo"
          drag
          :auto-upload="false"
          :on-change="handleFileChange"
          :show-file-list="false"
          accept="image/*"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">
            将图片拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持 jpg/png/gif 格式的图片
            </div>
          </template>
        </el-upload>

        <!-- 原图预览 -->
        <div v-if="originalImage" class="preview-box">
          <h3>原图预览</h3>
          <img :src="originalImage" alt="原图" class="preview-image" />
        </div>
      </div>

      <!-- 中间：水印设置 -->
      <div class="settings-section">
        <h3>水印设置</h3>
        
        <el-form :model="watermarkConfig" label-width="100px">
          <el-form-item label="水印类型">
            <el-radio-group v-model="watermarkConfig.type">
              <el-radio label="text">文字水印</el-radio>
              <el-radio label="image">图片水印</el-radio>
            </el-radio-group>
          </el-form-item>

          <!-- 文字水印设置 -->
          <template v-if="watermarkConfig.type === 'text'">
            <el-form-item label="水印文字">
              <el-input v-model="watermarkConfig.text" placeholder="请输入水印文字" />
            </el-form-item>
            <el-form-item label="字体大小">
              <el-slider v-model="watermarkConfig.fontSize" :min="12" :max="72" show-input />
            </el-form-item>
            <el-form-item label="字体颜色">
              <el-color-picker v-model="watermarkConfig.color" />
            </el-form-item>
            <el-form-item label="字体样式">
              <el-select v-model="watermarkConfig.fontFamily" style="width: 100%">
                <el-option label="Arial" value="Arial" />
                <el-option label="微软雅黑" value="Microsoft YaHei" />
                <el-option label="宋体" value="SimSun" />
                <el-option label="黑体" value="SimHei" />
              </el-select>
            </el-form-item>
            <el-form-item label="透明度">
              <el-slider v-model="watermarkConfig.textOpacity" :min="0" :max="100" :step="1" show-input />
            </el-form-item>
            <el-form-item label="旋转角度">
              <el-slider v-model="watermarkConfig.rotation" :min="-180" :max="180" :step="1" show-input />
              <div class="form-tip">单位：度（-180° 到 180°）</div>
            </el-form-item>
          </template>

          <!-- 图片水印设置 -->
          <template v-if="watermarkConfig.type === 'image'">
            <el-form-item label="水印图片">
              <el-upload
                :auto-upload="false"
                :on-change="handleWatermarkImageChange"
                :show-file-list="false"
                accept="image/*"
              >
                <el-button type="primary">选择水印图片</el-button>
              </el-upload>
              <div v-if="watermarkConfig.watermarkImage" class="watermark-preview">
                <img :src="watermarkConfig.watermarkImage" alt="水印图片" style="max-width: 200px; max-height: 100px;" />
              </div>
            </el-form-item>
            <el-form-item label="透明度">
              <el-slider v-model="watermarkConfig.opacity" :min="0" :max="100" :step="1" show-input />
            </el-form-item>
            <el-form-item label="缩放比例">
              <el-slider v-model="watermarkConfig.scale" :min="10" :max="200" :step="10" show-input />
            </el-form-item>
            <el-form-item label="旋转角度">
              <el-slider v-model="watermarkConfig.rotation" :min="-180" :max="180" :step="1" show-input />
              <div class="form-tip">单位：度（-180° 到 180°）</div>
            </el-form-item>
          </template>

          <!-- 位置设置 -->
          <el-form-item label="位置">
            <el-select v-model="watermarkConfig.position" style="width: 100%">
              <el-option label="左上" value="top-left" />
              <el-option label="右上" value="top-right" />
              <el-option label="左下" value="bottom-left" />
              <el-option label="右下" value="bottom-right" />
              <el-option label="居中" value="center" />
              <el-option label="自定义" value="custom" />
            </el-select>
          </el-form-item>

          <!-- 自定义位置 -->
          <template v-if="watermarkConfig.position === 'custom'">
            <el-form-item label="X坐标">
              <el-input-number v-model="watermarkConfig.x" :min="0" style="width: 100%" />
            </el-form-item>
            <el-form-item label="Y坐标">
              <el-input-number v-model="watermarkConfig.y" :min="0" style="width: 100%" />
            </el-form-item>
          </template>

          <!-- 重复模式 -->
          <el-form-item label="重复模式">
            <el-radio-group v-model="watermarkConfig.repeat">
              <el-radio label="none">不重复</el-radio>
              <el-radio label="repeat">重复填充</el-radio>
            </el-radio-group>
          </el-form-item>

          <!-- 重复模式设置 -->
          <template v-if="watermarkConfig.repeat === 'repeat'">
            <el-form-item label="水平间距">
              <el-input-number v-model="watermarkConfig.spacingX" :min="0" style="width: 100%" />
            </el-form-item>
            <el-form-item label="垂直间距">
              <el-input-number v-model="watermarkConfig.spacingY" :min="0" style="width: 100%" />
            </el-form-item>
          </template>

          <el-form-item>
            <el-button type="primary" @click="applyWatermark" :disabled="!originalImage">
              应用水印
            </el-button>
            <el-button @click="resetConfig">重置设置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 右侧：结果预览和下载 -->
      <div class="result-section">
        <h3>水印预览</h3>
        <div v-if="watermarkedImage" class="preview-box">
          <img :src="watermarkedImage" alt="水印图片" class="preview-image" />
          <div class="download-buttons">
            <el-button type="primary" :icon="Download" @click="downloadImage">
              下载图片
            </el-button>
            <el-button :icon="View" @click="previewImage">
              预览大图
            </el-button>
          </div>
        </div>
        <div v-else class="empty-preview">
          <el-empty description="请先上传图片并应用水印" />
        </div>
      </div>
    </div>

    <!-- 大图预览对话框 -->
    <el-dialog v-model="previewDialogVisible" title="图片预览" width="80%">
      <div class="preview-dialog-content">
        <img :src="watermarkedImage" alt="预览" style="max-width: 100%; height: auto;" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled, Download, View } from '@element-plus/icons-vue'

// 原图
const originalImage = ref('')
const originalFile = ref(null)

// 水印后的图片
const watermarkedImage = ref('')

// 预览对话框
const previewDialogVisible = ref(false)

// 水印配置
const watermarkConfig = reactive({
  type: 'text', // text 或 image
  text: '水印文字',
  fontSize: 24,
  color: '#000000',
  fontFamily: 'Arial',
  textOpacity: 50, // 文字水印透明度
  watermarkImage: '',
  watermarkImageFile: null,
  opacity: 50, // 图片水印透明度
  scale: 50,
  rotation: 0, // 旋转角度（度）
  position: 'bottom-right',
  x: 0,
  y: 0,
  repeat: 'none',
  spacingX: 100,
  spacingY: 100
})

// 处理文件上传
const handleFileChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    originalImage.value = e.target.result
    originalFile.value = file.raw
    watermarkedImage.value = '' // 清空之前的水印结果
  }
  reader.readAsDataURL(file.raw)
}

// 处理水印图片上传
const handleWatermarkImageChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    watermarkConfig.watermarkImage = e.target.result
    watermarkConfig.watermarkImageFile = file.raw
  }
  reader.readAsDataURL(file.raw)
}

// 应用水印
const applyWatermark = () => {
  if (!originalImage.value) {
    ElMessage.warning('请先上传图片')
    return
  }

  if (watermarkConfig.type === 'text' && !watermarkConfig.text) {
    ElMessage.warning('请输入水印文字')
    return
  }

  if (watermarkConfig.type === 'image' && !watermarkConfig.watermarkImage) {
    ElMessage.warning('请先上传水印图片')
    return
  }

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const img = new Image()

  img.onload = () => {
    // 设置画布尺寸
    canvas.width = img.width
    canvas.height = img.height

    // 绘制原图
    ctx.drawImage(img, 0, 0)

    if (watermarkConfig.type === 'text') {
      // 文字水印
      applyTextWatermark(ctx, canvas.width, canvas.height)
      // 转换为图片
      watermarkedImage.value = canvas.toDataURL('image/png')
      ElMessage.success('水印应用成功')
    } else {
      // 图片水印（异步处理）
      applyImageWatermark(ctx, canvas.width, canvas.height, canvas)
    }
  }

  img.src = originalImage.value
}

// 应用文字水印
const applyTextWatermark = (ctx, width, height) => {
  // 设置透明度
  ctx.globalAlpha = watermarkConfig.textOpacity / 100

  // 设置文字样式
  ctx.font = `${watermarkConfig.fontSize}px ${watermarkConfig.fontFamily}`
  ctx.fillStyle = watermarkConfig.color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // 测量文字宽度
  const textMetrics = ctx.measureText(watermarkConfig.text)
  const textWidth = textMetrics.width
  const textHeight = watermarkConfig.fontSize

  // 将角度转换为弧度
  const rotationRad = (watermarkConfig.rotation * Math.PI) / 180

  if (watermarkConfig.repeat === 'repeat') {
    // 重复填充
    const spacingX = watermarkConfig.spacingX || 100
    const spacingY = watermarkConfig.spacingY || 100

    for (let x = 0; x < width; x += textWidth + spacingX) {
      for (let y = 0; y < height; y += textHeight + spacingY) {
        ctx.save()
        // 移动到文字中心位置
        const centerX = x + textWidth / 2
        const centerY = y + textHeight / 2
        ctx.translate(centerX, centerY)
        // 旋转
        ctx.rotate(rotationRad)
        // 绘制文字（从中心点绘制）
        ctx.fillText(watermarkConfig.text, 0, 0)
        ctx.restore()
      }
    }
  } else {
    // 单个水印
    const position = getPosition(width, height, textWidth, textHeight)
    ctx.save()
    // 移动到文字中心位置
    ctx.translate(position.x, position.y)
    // 旋转
    ctx.rotate(rotationRad)
    // 绘制文字（从中心点绘制）
    ctx.fillText(watermarkConfig.text, 0, 0)
    ctx.restore()
  }
}

// 应用图片水印
const applyImageWatermark = (ctx, width, height, canvas) => {
  const watermarkImg = new Image()
  
  watermarkImg.onload = () => {
    // 计算水印图片尺寸
    const scale = watermarkConfig.scale / 100
    const watermarkWidth = watermarkImg.width * scale
    const watermarkHeight = watermarkImg.height * scale

    // 设置透明度
    ctx.globalAlpha = watermarkConfig.opacity / 100

    // 将角度转换为弧度
    const rotationRad = (watermarkConfig.rotation * Math.PI) / 180

    if (watermarkConfig.repeat === 'repeat') {
      // 重复填充
      const spacingX = watermarkConfig.spacingX || 100
      const spacingY = watermarkConfig.spacingY || 100

      for (let x = 0; x < width; x += watermarkWidth + spacingX) {
        for (let y = 0; y < height; y += watermarkHeight + spacingY) {
          ctx.save()
          // 移动到图片中心位置
          const centerX = x + watermarkWidth / 2
          const centerY = y + watermarkHeight / 2
          ctx.translate(centerX, centerY)
          // 旋转
          ctx.rotate(rotationRad)
          // 绘制图片（从中心点绘制）
          ctx.drawImage(watermarkImg, -watermarkWidth / 2, -watermarkHeight / 2, watermarkWidth, watermarkHeight)
          ctx.restore()
        }
      }
    } else {
      // 单个水印
      const position = getPosition(width, height, watermarkWidth, watermarkHeight)
      ctx.save()
      // 移动到图片中心位置
      const centerX = position.x + watermarkWidth / 2
      const centerY = position.y + watermarkHeight / 2
      ctx.translate(centerX, centerY)
      // 旋转
      ctx.rotate(rotationRad)
      // 绘制图片（从中心点绘制）
      ctx.drawImage(watermarkImg, -watermarkWidth / 2, -watermarkHeight / 2, watermarkWidth, watermarkHeight)
      ctx.restore()
    }

    // 重新生成图片
    watermarkedImage.value = canvas.toDataURL('image/png')
    ElMessage.success('水印应用成功')
  }

  watermarkImg.src = watermarkConfig.watermarkImage
}

// 获取水印位置
const getPosition = (canvasWidth, canvasHeight, watermarkWidth, watermarkHeight) => {
  let x = 0
  let y = 0

  switch (watermarkConfig.position) {
    case 'top-left':
      x = 20
      y = 20
      break
    case 'top-right':
      x = canvasWidth - watermarkWidth - 20
      y = 20
      break
    case 'bottom-left':
      x = 20
      y = canvasHeight - watermarkHeight - 20
      break
    case 'bottom-right':
      x = canvasWidth - watermarkWidth - 20
      y = canvasHeight - watermarkHeight - 20
      break
    case 'center':
      x = (canvasWidth - watermarkWidth) / 2
      y = (canvasHeight - watermarkHeight) / 2
      break
    case 'custom':
      x = watermarkConfig.x || 0
      y = watermarkConfig.y || 0
      break
  }

  return { x, y }
}

// 重置配置
const resetConfig = () => {
  Object.assign(watermarkConfig, {
    type: 'text',
    text: '水印文字',
    fontSize: 24,
    color: '#000000',
    fontFamily: 'Arial',
    textOpacity: 50,
    watermarkImage: '',
    watermarkImageFile: null,
    opacity: 50,
    scale: 50,
    rotation: 0,
    position: 'bottom-right',
    x: 0,
    y: 0,
    repeat: 'none',
    spacingX: 100,
    spacingY: 100
  })
  watermarkedImage.value = ''
}

// 下载图片
const downloadImage = () => {
  if (!watermarkedImage.value) {
    ElMessage.warning('没有可下载的图片')
    return
  }

  const link = document.createElement('a')
  link.download = `watermarked_${Date.now()}.png`
  link.href = watermarkedImage.value
  link.click()
  ElMessage.success('图片下载成功')
}

// 预览大图
const previewImage = () => {
  if (!watermarkedImage.value) {
    ElMessage.warning('没有可预览的图片')
    return
  }
  previewDialogVisible.value = true
}
</script>

<style scoped>
.watermark-standalone {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.header {
  text-align: center;
  color: #fff;
  margin-bottom: 30px;
}

.header h1 {
  margin: 20px 0 10px;
  font-size: 32px;
  font-weight: bold;
}

.subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

.watermark-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  max-width: 1600px;
  margin: 0 auto;
  min-height: 600px;
}

.upload-section,
.settings-section,
.result-section {
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.upload-section h3,
.settings-section h3,
.result-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-size: 18px;
}

.upload-demo {
  width: 100%;
}

.preview-box {
  margin-top: 20px;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  border: 1px solid #ddd;
  border-radius: 4px;
  display: block;
  margin: 0 auto;
}

.watermark-preview {
  margin-top: 10px;
}

.download-buttons {
  margin-top: 15px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.empty-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.preview-dialog-content {
  text-align: center;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

@media (max-width: 1200px) {
  .watermark-container {
    grid-template-columns: 1fr;
  }
}
</style>

