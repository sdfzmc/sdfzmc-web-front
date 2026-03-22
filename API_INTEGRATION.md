# 后端 API 集成说明

## 问题诊断

**之前的错误**: 
- 前端直接使用 `http://103.40.13.68:10951` 完整 URL 访问后端
- 这样会导致:
  1. **CORS 跨域问题** - 浏览器阻止跨域请求
  2. **Netlify 代理不生效** - 因为请求不经过 `/api/*` 路径

## 解决方案

### 1. 使用 Netlify API 代理

Netlify 的 `netlify.toml` 配置了重定向规则:

```toml
[[redirects]]
  from = "/api/*"
  to = "http://103.40.13.68:10951/api/:splat"
  status = 200
  force = true
```

**工作原理**:
```
浏览器请求: https://your-site.netlify.app/api/login
     ↓
Netlify 代理: 转发到 http://103.40.13.68:10951/api/login
     ↓
后端处理：FastAPI 处理请求
     ↓
返回结果：Netlify → 浏览器
```

### 2. 前端代码修改

**✅ 正确写法**:
```javascript
// 使用相对路径
const API_BASE = '/api';

// 登录请求
fetch(`${API_BASE}/token`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: formData
})

// 获取用户信息
fetch(`${API_BASE}/me`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})
```

**❌ 错误写法**:
```javascript
// 不要直接使用完整 URL!
const API_URL = 'http://103.40.13.68:10951';

fetch(`${API_URL}/token`, { ... })
// 这样会直接请求后端，绕过 Netlify 代理
// 可能导致 CORS 错误
```

### 3. 已修改的文件

#### login.js
- ✅ 将 `API_URL = 'http://103.40.13.68:10951'` 改为 `API_BASE = '/api'`
- ✅ 所有 fetch 请求改为 `${API_BASE}/...`

#### register.js
- ✅ 将 `API_URL = 'http://103.40.13.68:10951'` 改为 `API_BASE = '/api'`
- ✅ 所有 fetch 请求改为 `${API_BASE}/...`

### 4. API 端点映射

| 前端请求 | Netlify 代理到 | 后端处理 |
|---------|---------------|---------|
| `/api/token` | `http://103.40.13.68:10951/api/token` | FastAPI 登录 |
| `/api/me` | `http://103.40.13.68:10951/api/me` | 获取用户信息 |
| `/api/send-code` | `http://103.40.13.68:10951/api/send-code` | 发送验证码 |
| `/api/verify-code` | `http://103.40.13.68:10951/api/verify-code` | 验证验证码 |
| `/api/register` | `http://103.40.13.68:10951/api/register` | 用户注册 |

### 5. 本地开发

在本地开发时，你有两个选择:

#### 选项 A: 使用 Node.js 服务器
```bash
# 运行 server.js (已配置代理)
npm start
```

`server.js` 会启动一个 Express 服务器，并代理 API 请求到后端。

#### 选项 B: 直接打开 HTML 文件
由于使用了相对路径 `/api`,直接打开 HTML 文件无法工作。你需要:
1. 使用 Live Server 等浏览器扩展
2. 或者配置 hosts 文件使用本地域名

### 6. 部署检查清单

部署前请确认:

- ✅ 前端代码使用 `API_BASE = '/api'`
- ✅ 所有 API 请求使用相对路径
- ✅ `netlify.toml` 配置了正确的后端地址
- ✅ 后端服务器可公网访问
- ✅ 后端已配置 CORS 允许 Netlify 域名

### 7. 调试技巧

如果 API 调用失败:

1. **打开浏览器开发者工具 (F12)**
2. **查看 Network 标签**
   - 检查请求 URL 是否正确 (应该是 `/api/...`)
   - 检查响应状态码
3. **查看 Console 标签**
   - 查看是否有 CORS 错误
   - 查看 `console.log('API Base:', API_BASE)` 输出

### 8. 环境变量 (可选)

如果你需要根据环境切换 API 地址，可以使用 Netlify 环境变量:

```javascript
// 从环境变量读取 (Netlify 构建时注入)
const API_BASE = process.env.API_BASE || '/api';
```

在 `netlify.toml` 中配置:
```toml
[build.environment]
  API_BASE = "/api"
```

## 总结

现在前端代码已经修改为使用相对路径 `/api`,Netlify 会自动代理所有 API 请求到后端 FastAPI 服务器。

**关键变化**:
- ✅ 前端不再使用完整 URL
- ✅ 所有请求通过 Netlify 代理
- ✅ 避免 CORS 问题
- ✅ 后端功能完全保留!

部署后，用户可以正常:
- 登录/注册
- 接收验证码
- 获取用户信息
- 所有后端 API 功能都可用
