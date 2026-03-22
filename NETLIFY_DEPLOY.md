# Netlify 部署指南

## 问题诊断

之前部署后无页面的原因:
1. **目录结构混乱** - 文件分散在根目录、src、public 等目录
2. **路径引用错误** - 使用了绝对路径 (/styles/) 而不是相对路径
3. **Netlify 配置错误** - publish 目录设置不正确
4. **Node.js 服务器不工作** - Netlify 是静态托管，不运行 Node.js 服务器

## 解决方案

### 1. 项目结构

```
front/
├── public/              # 构建输出目录 (Netlify 发布目录)
│   ├── index.html      # 主页 (由构建脚本生成)
│   ├── pages/          # 子页面
│   ├── scripts/        # JavaScript 文件
│   ├── styles/         # CSS 文件
│   └── images/         # 图片资源
├── src/                # 源代码目录
│   ├── index.html      # 主页源文件
│   ├── pages/          # 页面源文件
│   ├── scripts/        # JS 源文件
│   └── styles/         # CSS 源文件
├── images/             # 图片资源
├── build.js            # 构建脚本
├── package.json
└── netlify.toml        # Netlify 配置
```

### 2. 构建流程

`build.js` 脚本会自动:
- 复制 `src/` 目录到 `public/`
- 复制 `images/` 到 `public/images/`
- 复制 `src/index.html` 到 `public/`
- **自动修复所有 HTML 文件中的路径引用** (关键!)

### 3. Netlify 配置说明

[netlify.toml](file://g:\github\mc-web\front\netlify.toml) 配置:

```toml
[build]
  command = "npm run build"  # 运行构建脚本
  publish = "public"         # 发布 public 目录

[build.environment]
  NODE_VERSION = "18"        # Node.js 版本
  API_URL = "http://103.40.13.68:10951"  # 后端 API 地址

# API 代理 - 将 /api/* 请求转发到后端
[[redirects]]
  from = "/api/*"
  to = "http://103.40.13.68:10951/api/:splat"
  status = 200
  force = true

# SPA 路由支持
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = false
```

**重要**: 前端代码必须使用相对路径 `/api/...` 才能通过 Netlify 代理访问后端!

### 4. 部署步骤

#### 方法一:Git 自动部署 (推荐)

1. 将代码推送到 GitHub
2. 在 Netlify 导入 GitHub 仓库
3. 设置构建配置:
   - **Base directory**: (留空)
   - **Build command**: `npm run build`
   - **Publish directory**: `public`
4. 设置环境变量:
   - `NODE_VERSION`: `18`
   - `API_URL`: `http://103.40.13.68:10951`
5. 点击部署

#### 方法二:Netlify CLI 手动部署

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录 Netlify
netlify login

# 构建项目
npm run build

# 部署到 Netlify
netlify deploy --prod
```

### 5. 本地测试构建

```bash
# 运行构建脚本
node build.js

# 或使用 npm 命令
npm run build

# 查看生成的 public 目录
ls public/
```

### 6. 路径修复说明

构建脚本会自动修复以下路径问题:

**修复前 (源文件):**
```html
<link rel="stylesheet" href="/styles/main.css">
<script src="/scripts/login.js"></script>
<a href="/pages/login.html">登录</a>
<img src="\images\avatar.jpg">
```

**修复后 (public 目录):**
```html
<!-- 根目录页面 -->
<link rel="stylesheet" href="./styles/main.css">
<script src="./scripts/login.js"></script>
<a href="./pages/login.html">登录</a>
<img src="./images/avatar.jpg">

<!-- 子页面 (pages/login.html) -->
<link rel="stylesheet" href="../styles/main.css">
<script src="../scripts/login.js"></script>
<a href="../pages/about.html">关于</a>
<img src="../images/avatar.jpg">
```

### 7. 后端 API 调用

前端通过 Netlify 的代理功能调用后端 FastAPI:

```javascript
// 前端代码中直接使用相对路径
fetch('/api/login', {
  method: 'POST',
  body: JSON.stringify(data)
})

// Netlify 会自动将请求转发到:
// http://103.40.13.68:10951/api/login
```

### 8. 常见问题

**Q: 部署后页面空白？**
- 检查浏览器控制台 (F12) 查看错误信息
- 确认资源文件 (CSS/JS) 路径是否正确
- 检查 Netlify 构建日志是否有错误

**Q: API 请求失败？**
- 确认后端服务器是否可访问
- 检查 [netlify.toml](file://g:\github\mc-web\front\netlify.toml) 中的 API_URL 是否正确
- 查看浏览器控制台的 CORS 错误

**Q: 页面刷新后 404？**
- SPA 路由需要重定向规则
- 检查 [netlify.toml](file://g:\github\mc-web\front\netlify.toml) 中的 redirects 配置

### 9. 验证部署

部署完成后，访问:
- 主页：`https://your-site.netlify.app/`
- 登录页：`https://your-site.netlify.app/pages/login.html`
- 关于页：`https://your-site.netlify.app/pages/about.html`

检查:
- ✅ 页面正常显示
- ✅ CSS 样式加载
- ✅ JavaScript 功能正常
- ✅ 图片显示正常
- ✅ API 请求成功

## 重要提示

1. **不要直接修改 public 目录** - 每次构建都会被覆盖
2. **修改源文件后需要重新构建和部署**
3. **确保后端 API 允许跨域请求 (CORS)**
4. **生产环境建议使用 HTTPS 的后端 API 地址**
