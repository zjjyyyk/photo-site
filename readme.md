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

编辑 `src/pages/HomePage.tsx` 文件，找到以下代码：

```tsx
{/* 新建分类按钮 - 已隐藏 */}
{false && (
  <motion.button
    onClick={() => setIsCreateModalOpen(true)}
    // ... 其他属性
  >
    新建分类
  </motion.button>
)}
```

将 `{false &&` 改为 `{true &&` 或者直接移除条件判断：

```tsx
{/* 新建分类按钮 - 已启用 */}
<motion.button
  onClick={() => setIsCreateModalOpen(true)}
  whileHover={{ scale: 1.05, y: -2 }}
  whileTap={{ scale: 0.95 }}
  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-warm-600 to-warm-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 mb-12"
>
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
  新建分类
</motion.button>
```

### 3. 启用"上传照片"按钮

编辑 `src/pages/CategoryPage.tsx` 文件，找到以下代码：

```tsx
{/* 上传按钮 - 已隐藏 */}
{false && (
  <div className="absolute top-0 right-0">
    <motion.button
      onClick={() => setIsUploadModalOpen(true)}
      // ... 其他属性
    >
      上传照片
    </motion.button>
  </div>
)}
```

将 `{false &&` 改为 `{true &&` 或者直接移除条件判断：

```tsx
{/* 上传按钮 - 已启用 */}
<div className="absolute top-0 right-0">
  <motion.button
    onClick={() => setIsUploadModalOpen(true)}
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.95 }}
    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-warm-600 to-warm-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
  >
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
    上传照片
  </motion.button>
</div>
```

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

