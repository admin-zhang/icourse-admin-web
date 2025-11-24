# iCourse 管理后台

基于 Vue3 + Element Plus 的管理后台项目

## 技术栈

- Vue 3
- Vue Router 4
- Pinia
- Element Plus
- Axios
- Vite

## 功能特性

- ✅ 管理员登录（用户名密码/短信验证码）
- ✅ 课程管理
- ✅ 用户管理
- ✅ 订单管理
- ✅ Token 自动管理
- ✅ 路由守卫

## 安装依赖

```bash
npm install
```

## 开发运行

```bash
npm run dev
```

访问地址：`http://localhost:3001`

## 构建生产版本

```bash
npm run build
```

## 项目结构

```
icourse-admin-web/
├── src/
│   ├── api/           # API 接口
│   ├── router/        # 路由配置
│   ├── stores/        # Pinia 状态管理
│   ├── utils/         # 工具函数
│   ├── views/         # 页面组件
│   ├── layout/        # 布局组件
│   ├── App.vue        # 根组件
│   └── main.js        # 入口文件
├── index.html
├── vite.config.js
└── package.json
```

## 注意事项

1. 管理端使用 `scene='admin'` 进行短信验证码登录
2. Token 使用 `admin_` 前缀保存在 localStorage
3. 端口号：3001

