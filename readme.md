# 📸 Photo Site - 个人照片展示网站

一个基于 React + TypeScript 构建的现代化照片展示网站，支持混合模式运行：既可以作为纯展示网站运行，也可以启用上传功能进行照片管理。

### 界面

![网站界面截图](docs/website-screenshot.png)

## 🛠️ 技术栈

- **前端**: React 18 + TypeScript + Tailwind CSS
- **动画**: Framer Motion
- **后端**: Node.js + Express + Multer

## 🚀 快速开始

### 展示模式（默认）

```bash
# 克隆项目
git clone https://github.com/zjjyyyk/photo-site.git
cd photo-site

# 安装依赖
npm install

# 启动前端应用
npm start
```

访问 `http://localhost:3000` 即可浏览照片展示网站。

### 上传管理模式

如果你需要上传和管理照片，需要额外启动后端服务器：

```bash
# 启动后端服务器
npm run server

# 另开终端启动前端
npm start
```

然后按照下面的说明启用上传按钮。

## 🔧 如何启用上传功能

默认情况下，上传按钮是隐藏的。如果你想要启用上传功能，请按照以下步骤操作：

### 1. 启动后端服务器

```bash
npm run server
```

后端服务器将在 `http://localhost:3001` 启动。

### 2. 启用"新建分类"按钮

编辑 `src/pages/HomePage.tsx` 文件，将`isEditMode`设置为`true`。

### 3. 启用"上传照片"按钮

编辑 `src/pages/CategoryPage.tsx` 文件，将`isEditMode`设置为`true`。

## 📤 如何上传照片

启用上传功能后，你可以按照以下步骤添加照片：

### 创建新分类

1. 在主页点击"新建分类"按钮
2. 在弹出的对话框中输入：
   - **分类名称**: 例如"风景摄影"
   - **分类描述**: 例如"记录美丽的自然风光"
   - **封面图片**: 选择一张代表性的图片作为分类封面
3. 点击"创建分类"完成创建

### 上传照片到分类

1. 进入任意分类页面
2. 点击右上角的"上传照片"按钮
3. 在上传对话框中：
   - 点击"选择照片"或拖拽照片文件到上传区域
   - 支持批量选择多张照片
   - 支持的格式：JPG、PNG、WEBP等
4. 为每张照片添加标题和描述（可选）
5. 点击"开始上传"

## 🔧 维护脚本

项目提供了两个实用的维护脚本来管理现有图片：

### generate-thumbnails.js - 批量生成缩略图

为所有现有图片生成缩略图，并更新数据文件中的缩略图路径。

```bash
# 运行缩略图生成脚本
node generate-thumbnails.js
```

**功能说明：**
- 自动为 `public/images/` 目录下的所有图片生成 400x300 的缩略图
- 缩略图保存在 `public/images/thumbnail/` 目录
- 自动更新 `userCategories.json` 中的 `thumbnailUrl` 字段
- 跳过已存在的缩略图，避免重复处理
- 支持 JPG、PNG、WEBP 等常见图片格式

### rename-existing-images.js - 批量重命名图片

将现有图片重命名为规范的 `[标题]_[时间戳]` 格式。

```bash
# 预览将要重命名的文件（不实际执行）
node rename-existing-images.js

# 执行实际的重命名操作
node rename-existing-images.js --execute
```

**功能说明：**
- 根据图片标题和上传时间戳重命名文件
- 智能处理文件名冲突，自动添加序号区分
- 安全处理特殊字符，确保文件名兼容性
- 同时重命名原图和对应的缩略图
- 自动更新数据文件中的URL路径
- 执行前会创建数据备份文件

**安全提示：** 建议先运行预览模式查看重命名计划，确认无误后再执行实际操作。

