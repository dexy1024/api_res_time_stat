# GitHub Pages 部署指南

## 快速部署步骤

### 1. 创建 GitHub 仓库

1. 在 GitHub 上创建一个新仓库（例如：`API_Time_Count`）
2. 不要初始化 README、.gitignore 或 license（因为项目已有这些文件）

### 2. 初始化本地仓库并推送

```bash
# 进入项目目录
cd API_Time_Count

# 初始化 Git 仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交更改
git commit -m "Initial commit: API 耗时统计工具"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/API_Time_Count.git

# 推送到 main 分支
git branch -M main
git push -u origin main
```

### 3. 启用 GitHub Pages

1. 进入仓库的 **Settings** 页面
2. 在左侧菜单中找到 **Pages**
3. 在 **Source** 部分：
   - 选择 **GitHub Actions** 作为部署源
   - 保存设置

### 4. 等待自动部署

- 推送代码后，GitHub Actions 会自动开始部署
- 可以在仓库的 **Actions** 标签页查看部署进度
- 部署完成后，访问地址：`https://你的用户名.github.io/API_Time_Count/`

## 后续更新

每次推送代码到 `main` 分支时，GitHub Actions 会自动重新部署：

```bash
git add .
git commit -m "更新说明"
git push origin main
```

## 自定义域名（可选）

如果需要使用自定义域名：

1. 在仓库的 **Settings** > **Pages** 中设置自定义域名
2. 在项目根目录创建 `CNAME` 文件，内容为你的域名
3. 在域名 DNS 中添加 CNAME 记录指向 `你的用户名.github.io`

## 故障排除

### 部署失败

- 检查 GitHub Actions 日志（在 Actions 标签页）
- 确保 `.github/workflows/deploy.yml` 文件存在且格式正确
- 确保所有文件都已提交到仓库

### 页面 404

- 确认 GitHub Pages 已启用（Settings > Pages）
- 确认部署源设置为 "GitHub Actions"
- 等待几分钟后刷新页面（首次部署可能需要时间）

### 资源加载失败

- 检查浏览器控制台是否有错误
- 确认所有资源文件路径使用相对路径
- 确认 CDN 资源可以正常访问

## 技术栈说明

本项目使用纯静态技术栈，完全兼容 GitHub Pages：

- ✅ HTML5 / CSS3 / JavaScript (ES6+)
- ✅ 所有依赖通过 CDN 加载（Chart.js、SheetJS）
- ✅ 无需构建步骤，直接部署
- ✅ 支持 GitHub Actions 自动部署

