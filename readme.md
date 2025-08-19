# 照片分享 - 个人照片展示网站

一个简洁、温馨的响应式照片分享网站，使用 React + TypeScript + Tailwind CSS 构建。

![项目截图](https://gitee.com/zjjyyyk/figurebed/raw/master/images/20250819195925563.png)

## ✨ 特性

- 🎨 **温馨设计风格** - 采用温暖的米色、奶茶色配色方案
- 📱 **完全响应式** - 适配桌面、平板和移动设备
- 🖼️ **优雅的照片展示** - 支持分类浏览和灯箱效果
- ⚡ **流畅动画** - 使用 Framer Motion 实现丝滑的交互动画
- 🧭 **友好导航** - 清晰的面包屑导航和分页功能
- 🔗 **GitHub 集成** - 页脚包含 GitHub 链接，支持一键跳转
- 🚀 **自动部署** - 基于 GitHub Actions 的自动化部署

## 🚀 快速开始

### 环境要求

- Node.js (版本 16 或更高)
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/zjjyyyk/photo-site.git
cd photo-site
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发服务器**
```bash
npm start
```

4. **访问网站**
打开浏览器访问 `http://localhost:3000/photo-site`

> **📝 注意**: 本项目配置了子路径部署，所以本地开发时访问地址为 `http://localhost:3000/photo-site`，而不是 `http://localhost:3000`。这确保了本地开发环境与 GitHub Pages 部署环境 (`https://zjjyyyk.github.io/photo-site/`) 的一致性。


## 📁 项目结构

```
photo-site/
├── .github/               # GitHub 配置
│   └── workflows/
│       └── deploy.yml     # GitHub Actions 部署脚本
├── public/                # 静态资源
│   ├── images/           # 照片存储目录
│   ├── index.html        # 主页面模板
│   ├── 404.html          # SPA 路由支持页面
│   ├── favicon.ico       # 网站图标
│   └── manifest.json     # PWA 配置
├── src/
│   ├── components/       # 可复用组件
│   │   ├── Navigation.tsx    # 导航栏组件
│   │   ├── Lightbox.tsx      # 图片灯箱组件
│   │   ├── PhotoCard.tsx     # 照片卡片组件
│   │   ├── Pagination.tsx    # 分页组件
│   │   ├── Breadcrumb.tsx    # 面包屑导航
│   │   ├── ScrollToTop.tsx   # 返回顶部按钮
│   │   └── Loading.tsx       # 加载动画组件
│   ├── pages/            # 页面组件
│   │   ├── HomePage.tsx      # 首页
│   │   └── CategoryPage.tsx  # 分类页面
│   ├── hooks/            # 自定义 Hooks
│   │   └── index.ts          # Hook 导出文件
│   ├── data/             # 数据文件
│   │   └── photos.ts         # 照片数据配置
│   ├── types/            # TypeScript 类型定义
│   │   └── index.ts          # 全局类型定义
│   ├── App.tsx           # 应用主组件
│   ├── App.css           # 应用样式
│   ├── index.tsx         # 应用入口
│   └── index.css         # 全局样式
├── build/                # 构建输出目录 (自动生成)
├── tailwind.config.js    # Tailwind CSS 配置
├── postcss.config.js     # PostCSS 配置
├── tsconfig.json         # TypeScript 配置
├── package.json          # 项目依赖和脚本
└── readme.md             # 项目说明文档
```

## 🎨 个性化定制指南

### 1. 修改网站基本信息

#### 更改网站标题
编辑 `src/components/Navigation.tsx` 和 `src/pages/HomePage.tsx` 中的标题文字：
- 导航栏品牌名称
- 首页主标题和描述

#### 更改页脚信息
编辑 `src/App.tsx` 中的页脚部分，修改 GitHub 链接和版权信息。

### 2. 添加你的照片

#### 照片数据结构说明
项目当前使用 `generatePhotos()` 函数创建示例照片。要使用您的照片，需要在 `src/data/photos.ts` 中进行替换。

#### 方式一：完全自定义（推荐）
创建您自己的照片数组来替换生成的照片：

```typescript
// 创建您的照片数组
const myLandscapePhotos = [
  {
    id: 1,
    url: '/images/landscape/my-sunset.jpg',
    thumbnailUrl: '/images/landscape/thumbs/my-sunset.jpg',
    title: '日落美景',
    description: '在海边拍摄的壮丽日落',
    tags: ['日落', '海景', '自然'],
    exif: {
      camera: 'Canon EOS R5',
      lens: '24-70mm f/2.8',
      iso: 100,
      aperture: 'f/8.0',
      shutterSpeed: '1/125s',
      focalLength: '50mm',
    },
    date: '2024-01-01',
    location: '青岛海滨',
  },
  // 添加更多照片...
];

// 在分类配置中使用您的照片
export const photoCategories: PhotoCategory[] = [
  {
    id: 'landscape',
    name: '风景摄影',
    description: '我的风景摄影作品',
    coverImage: '/images/landscape/my-cover.jpg',
    photos: myLandscapePhotos, // 使用您的照片数组
    totalCount: myLandscapePhotos.length
  },
  // 其他分类可以继续使用 generatePhotos 或自定义数组
];
```

#### 方式二：混合使用
保留部分生成照片，只自定义特定分类：

```typescript
export const photoCategories: PhotoCategory[] = [
  {
    id: 'landscape',
    name: '风景摄影',
    photos: myCustomLandscapePhotos, // 使用自定义照片
    totalCount: myCustomLandscapePhotos.length
  },
  {
    id: 'portrait',
    name: '人像摄影',
    photos: generatePhotos('portrait', 15), // 继续使用生成照片
    totalCount: 15
  }
];
```

#### 准备照片文件
1. 在 `public/images/` 目录下创建分类文件夹
2. 将照片文件放入对应文件夹
3. 建议创建缩略图文件夹 `thumbs/` 用于快速加载

```
public/images/
├── landscape/
│   ├── my-sunset.jpg
│   ├── my-mountain.jpg
│   └── thumbs/
│       ├── my-sunset.jpg
│       └── my-mountain.jpg
└── portrait/
    └── ...
```

📖 **详细的照片添加教程请查看：[如何添加照片.md](./如何添加照片.md)**

### 3. 自定义配色方案

#### 修改主色调
编辑 `tailwind.config.js`:

```javascript
colors: {
  // 主色系 - 可以修改为你喜欢的颜色
  warm: {
    50: '#你的颜色代码',
    100: '#你的颜色代码',
    // ... 其他色调
    900: '#你的颜色代码',
  },
  // 辅助色系
  cream: {
    50: '#你的颜色代码',
    // ... 其他色调
  }
}
```

#### 颜色使用说明
- `warm-50` 到 `warm-100`: 浅色背景
- `warm-400` 到 `warm-600`: 主要按钮和强调色
- `warm-700` 到 `warm-900`: 文字和深色元素

#### 当前配色方案
项目默认使用温暖的奶茶色调：
- **warm 系列**: 从浅米色(#fdf9f3)到深棕色(#765431)
- **cream 系列**: 从奶白色(#fffef7)到金黄色(#967526)

### 4. 修改字体

#### 添加新字体
1. 在 `src/index.css` 中添加 Google Fonts 导入：
```css
@import url('https://fonts.googleapis.com/css2?family=你的字体名称:wght@300;400;500;600;700&display=swap');
```

2. 在 `tailwind.config.js` 中配置字体：
```javascript
fontFamily: {
  'sans': ['你的字体名称', 'ui-sans-serif', 'system-ui'],
  'serif': ['你的衬线字体', 'ui-serif', 'Georgia'],
},
```

#### 当前字体配置
- **无衬线字体**: Inter (现代、简洁)
- **衬线字体**: Playfair Display (优雅、经典)

### 5. 添加新的页面分类

#### 创建新分类
1. 在 `src/data/photos.ts` 中添加新分类
2. 添加对应的照片数据
3. 导航会自动生成新的菜单项

#### 自定义分类页面
如需特殊的分类页面样式，可以修改 `src/pages/CategoryPage.tsx`

### 6. 组件个性化

#### 修改照片卡片样式
编辑 `src/components/PhotoCard.tsx` 来调整照片展示效果

#### 自定义灯箱
编辑 `src/components/Lightbox.tsx` 来修改图片浏览体验

#### 调整分页
编辑 `src/components/Pagination.tsx` 来改变分页样式和行为

### 7. 优化性能

#### 图片优化建议
1. 使用现代图片格式 (WebP)
2. 提供多种尺寸的图片
3. 使用图片 CDN 服务 (如 Cloudinary, ImageKit)

#### 懒加载配置
项目已内置图片懒加载，可在 `src/hooks/index.ts` 中调整配置

## 🛠️ 开发指南

### 添加新组件

1. 在 `src/components/` 创建新组件文件
2. 使用 TypeScript 和 Tailwind CSS
3. 导出组件供其他文件使用

```tsx
// 示例：src/components/YourComponent.tsx
import React from 'react';

interface YourComponentProps {
  title: string;
  className?: string;
}

const YourComponent: React.FC<YourComponentProps> = ({ title, className = '' }) => {
  return (
    <div className={`your-styles ${className}`}>
      <h2>{title}</h2>
    </div>
  );
};

export default YourComponent;
```

### 自定义动画

使用 Framer Motion 添加动画：

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  你的内容
</motion.div>
```

### 响应式设计

使用 Tailwind 的响应式前缀：

```tsx
<div className="text-sm md:text-lg lg:text-xl">
  响应式文字大小
</div>
```

### 断点说明
- `sm`: 640px 及以上
- `md`: 768px 及以上 (平板)
- `lg`: 1024px 及以上 (桌面)
- `xl`: 1280px 及以上 (大屏幕)

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **样式框架**: Tailwind CSS 3.4.x
- **动画库**: Framer Motion
- **路由**: React Router DOM
- **构建工具**: Create React App
- **部署**: GitHub Pages + GitHub Actions

## 📝 项目特点

- ✅ 完全响应式设计
- ✅ 支持子路径部署
- ✅ 自动化 CI/CD 部署
- ✅ 优雅的动画效果
- ✅ 图片懒加载
- ✅ TypeScript 类型安全

## 🚀 在线预览

访问 [https://zjjyyyk.github.io/photo-site/](https://zjjyyyk.github.io/photo-site/) 查看在线演示。

---

**💡 提示**: 
- 如果你需要更多功能或遇到问题，可以参考组件代码或创建 Issue 讨论
- 建议先在本地测试所有修改，确保网站正常运行后再部署
- 定期备份你的照片和配置文件

**🎯 下一步**:
1. 替换示例照片为你的作品
2. 修改网站标题和描述
3. 调整配色方案（可选）
4. 部署到生产环境

享受构建你的个人照片分享网站的过程！📸✨
