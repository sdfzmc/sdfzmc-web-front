#!/bin/bash
# Netlify 快速部署脚本

echo "======================================"
echo "  Netlify 部署准备工具"
echo "======================================"
echo ""

# 检查是否在 front 目录
if [ ! -f "netlify.toml" ]; then
    echo "❌ 错误：请在 front 目录下运行此脚本"
    exit 1
fi

echo "✅ 检测到 netlify.toml 配置文件"

# 检查必要文件
echo ""
echo "检查必要文件..."

if [ -f "public/index.html" ]; then
    echo "✅ public/index.html 存在"
else
    echo "❌ 错误：找不到 public/index.html"
    exit 1
fi

if [ -d "src" ]; then
    echo "✅ src 目录存在"
else
    echo "❌ 错误：找不到 src 目录"
    exit 1
fi

if [ -d "styles" ] || [ -d "src/styles" ]; then
    echo "✅ styles 目录存在"
else
    echo "⚠️  警告：找不到 styles 目录"
fi

if [ -d "scripts" ] || [ -d "src/scripts" ]; then
    echo "✅ scripts 目录存在"
else
    echo "⚠️  警告：找不到 scripts 目录"
fi

echo ""
echo "======================================"
echo "  部署检查完成！"
echo "======================================"
echo ""
echo "下一步操作："
echo ""
echo "1. 使用 Git 部署（推荐）："
echo "   - 提交代码到 GitHub/GitLab"
echo "   - 在 Netlify 连接仓库"
echo "   - 自动部署"
echo ""
echo "2. 手动部署："
echo "   - 登录 https://app.netlify.com/"
echo "   - 拖拽 front 文件夹到部署区域"
echo ""
echo "3. 使用 Netlify CLI："
echo "   - 安装：npm install -g netlify-cli"
echo "   - 登录：netlify login"
echo "   - 部署：netlify deploy --prod"
echo ""
echo "======================================"
