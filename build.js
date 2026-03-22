const fs = require('fs');
const path = require('path');

// 源目录
const srcDir = path.join(__dirname, 'src');
const publicDir = path.join(__dirname, 'public');

// 确保 public 目录存在
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 复制函数
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${srcPath} -> ${destPath}`);
    }
  }
}

// 复制 styles
const srcStyles = path.join(srcDir, 'styles');
const destStyles = path.join(publicDir, 'styles');
if (fs.existsSync(srcStyles)) {
  copyDir(srcStyles, destStyles);
  console.log('✓ Styles copied');
}

// 复制 scripts
const srcScripts = path.join(srcDir, 'scripts');
const destScripts = path.join(publicDir, 'scripts');
if (fs.existsSync(srcScripts)) {
  copyDir(srcScripts, destScripts);
  console.log('✓ Scripts copied');
}

// 复制 pages
const srcPages = path.join(srcDir, 'pages');
const destPages = path.join(publicDir, 'pages');
if (fs.existsSync(srcPages)) {
  copyDir(srcPages, destPages);
  console.log('✓ Pages copied');
}

// 复制 images
const srcImages = path.join(__dirname, 'images');
const destImages = path.join(publicDir, 'images');
if (fs.existsSync(srcImages)) {
  copyDir(srcImages, destImages);
  console.log('✓ Images copied');
}

// 复制 src 目录的 index.html 到 public
const srcIndexHtml = path.join(srcDir, 'index.html');
const publicIndexHtml = path.join(publicDir, 'index.html');
if (fs.existsSync(srcIndexHtml)) {
  fs.copyFileSync(srcIndexHtml, publicIndexHtml);
  console.log('✓ index.html copied');
} else {
  console.log('⚠ src/index.html not found, skipping...');
}

// 修复所有 HTML 文件的路径引用
function fixHtmlPaths(filePath, isRootPage = false) {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 修复 CSS 路径 - 从 /styles/ 改为 ../styles/ 或 ./styles/
  content = content.replace(/href="\/styles\//g, isRootPage ? 'href="./styles/' : 'href="../styles/');
  
  // 修复 JS 路径 - 从 /scripts/ 改为 ../scripts/ 或 ./scripts/
  content = content.replace(/src="\/scripts\//g, isRootPage ? 'src="./scripts/' : 'src="../scripts/');
  
  // 修复 pages 路径 - 从 /pages/ 改为 ./pages/ 或 ../pages/
  content = content.replace(/href="\/pages\//g, isRootPage ? 'href="./pages/' : 'href="../pages/');
  
  // 修复 images 路径 - 从 \images\ 或 /images/ 改为 ../images/ 或 ./images/
  content = content.replace(/src="\\images\\/g, isRootPage ? 'src="./images/' : 'src="../images/');
  content = content.replace(/src="\/images\//g, isRootPage ? 'src="./images/' : 'src="../images/');
  
  // 修复根链接 - 从 href="/ 改为 href="./  (但保留 /#intro 等锚点)
  content = content.replace(/href="\/(?=[^#])/g, 'href="./');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed paths in: ${filePath}`);
}

// 修复根页面的路径
fixHtmlPaths(publicIndexHtml, true);

// 修复 pages 目录下的所有 HTML 文件
if (fs.existsSync(destPages)) {
  const pageFiles = fs.readdirSync(destPages);
  for (let file of pageFiles) {
    if (file.endsWith('.html')) {
      fixHtmlPaths(path.join(destPages, file), false);
    }
  }
}

console.log('\nBuild completed successfully!');
console.log('Public directory is ready for deployment.');
