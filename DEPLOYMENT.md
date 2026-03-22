# Netlify 部署指南

本指南将帮助你将帅太附中神人服前端部署到 Netlify。

## 📋 前提条件

1. 拥有 Netlify 账号（如果没有，访问 [netlify.com](https://www.netlify.com/) 注册）
2. **只有 `front` 目录会被推送到 Git 仓库**
3. 后端 API 已部署并可访问（`http://103.40.13.68:10951`）

## 📁 项目结构

```
mc-web/
├── front/              # 前端项目（独立部署到 Netlify）
│   ├── public/
│   ├── src/
│   ├── netlify.toml   # Netlify 配置文件
│   └── DEPLOYMENT.md  # 本文件
└── main/               # 后端项目（单独部署）
    ├── main.py
    └── requirements.txt
```

## 🚀 部署方法

### 方法一：通过 Git 仓库部署（推荐）

#### 步骤 1：准备 Git 仓库

**重要**：只有 `front` 目录需要推送到 Netlify

```bash
# 在项目根目录
cd front

# 初始化 Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 推送到远程仓库
git push origin main
```

或者，如果你想保持前后端在同一个仓库但只部署前端：

```bash
# 在项目根目录创建 .gitignore
echo "main/" >> .gitignore

# 只推送 front 目录的内容
cd front
git add .
git commit -m "Deploy frontend"
git push origin main
```

#### 步骤 2：连接 Netlify

1. 登录 [Netlify](https://app.netlify.com/)
2. 点击 **"Add new site"** → **"Import an existing project"**
3. 选择你的 Git 服务商（GitHub/GitLab/Bitbucket）
4. 授权 Netlify 访问你的仓库
5. **选择 `front` 目录所在的分支**

#### 步骤 3：配置构建设置

Netlify 会自动检测 `netlify.toml` 配置文件，无需手动配置。

如果需要手动配置：

- **Base directory**: `.` (当前目录)
- **Build command**: `echo 'Building static site...'`
- **Publish directory**: `.`

#### 步骤 4：配置环境变量

在 Netlify 控制台中添加环境变量：

1. 进入 **Site settings** → **Environment variables**
2. 点击 **"Add a variable"**
3. 添加以下变量（如果需要）：
   - **Key**: `API_URL`
   - **Value**: `http://103.40.13.68:10951`

#### 步骤 5：部署

1. 点击 **"Deploy site"**
2. 等待构建完成（通常 1-2 分钟）
3. 部署成功后，Netlify 会给你一个随机域名，如：`https://your-site-name.netlify.app`

---

### 方法二：手动拖拽部署

#### 步骤 1：准备文件
确保你的前端文件在 `front` 目录中，结构如下：
```
front/
├── public/
│   └── index.html
├── src/
│   ├── pages/
│   ├── scripts/
│   └── styles/
├── images/
└── netlify.toml
```

#### 步骤 2：拖拽部署
1. 登录 [Netlify](https://app.netlify.com/)
2. 进入 **"Sites"** 页面
3. 将 `front` 文件夹拖拽到 **"Drag and drop your site output folder here"** 区域
4. 等待上传完成

---

## ⚙️ 配置说明

### netlify.toml 配置文件

已创建的 `netlify.toml` 文件包含以下配置：

```toml
[build]
  base = "front"
  command = "echo 'Building static site...'"
  publish = "front"
```

- **base**: 基础目录
- **command**: 构建命令（静态站点不需要构建）
- **publish**: 发布目录

### 环境变量（可选）

如果后端 API 地址需要配置，可以在 Netlify 中添加环境变量：

1. 进入 **Site settings** → **Environment variables**
2. 点击 **"Add a variable"**
3. 添加：
   - **Key**: `API_URL`
   - **Value**: `https://your-backend-api.com`

然后在前端代码中使用：
```javascript
const API_URL = process.env.API_URL || 'http://localhost:8000';
```

---

## 🔧 后端 API 配置

由于前端部署在 Netlify，后端需要：

1. **允许跨域访问（CORS）**
   在 `main.py` 中已配置 CORS：
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],  # 生产环境建议指定具体域名
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

2. **更新前端 API 地址**
   修改 `register.js` 和 `login.js` 中的 API_URL：
   ```javascript
   let API_URL = 'https://your-backend-api.com';
   ```

---

## 📝 部署检查清单

- [ ] 所有 HTML/CSS/JS 文件在 `front` 目录
- [ ] `netlify.toml` 配置文件已创建
- [ ] 测试本地运行正常
- [ ] 后端 API 已部署并可访问
- [ ] CORS 配置正确
- [ ] Cloudflare Turnstile 密钥已配置
- [ ] 测试注册/登录功能

---

## 🐛 常见问题

### 1. 页面空白
- 检查浏览器控制台是否有错误
- 确认文件路径正确（使用相对路径）
- 检查 `netlify.toml` 配置

### 2. API 请求失败
- 确认后端 API 地址正确
- 检查 CORS 配置
- 确保后端服务正在运行

### 3. Turnstile 验证不显示
- 在 Cloudflare Dashboard 添加 Netlify 域名到允许的域名列表
- 检查 Site Key 配置是否正确

### 4. 路由 404 错误
- `netlify.toml` 中已配置 SPA 重定向规则
- 确保所有路由都指向 `index.html`

---

## 📊 持续部署

使用 Git 仓库部署时，每次推送到主分支都会自动触发构建：

```bash
git push origin main
```

Netlify 会自动：
1. 检测代码变更
2. 运行构建命令
3. 部署新版本
4. 自动回滚（如果构建失败）

---

## 🔗 有用链接

- [Netlify 文档](https://docs.netlify.com/)
- [Netlify 配置参考](https://docs.netlify.com/configure-builds/file-based-configuration/)
- [Netlify CLI](https://docs.netlify.com/cli/get-started/)
- [Netlify 表单](https://docs.netlify.com/forms/setup/)

---

## 💡 提示

1. **使用 Netlify CLI 本地测试**：
   ```bash
   npm install -g netlify-cli
   netlify dev
   ```

2. **预览部署**：
   每个 Pull Request 都会自动生成预览部署

3. **回滚**：
   在 Netlify 控制台可以轻松回滚到之前的版本

祝你部署成功！🎉
