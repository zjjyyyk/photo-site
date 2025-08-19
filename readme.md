# 照片分享 - 个人照片展示网站

一个简洁、温馨的响应式照片分享网站，使用 React + TypeScript + Tailwind CSS 构建。

![项目截图](https://gitee.com/zjjyyyk/figurebed/raw/master/images/20250819183818863.png)

## ✨ 特性

- 🎨 **温馨设计风格** - 采用温暖的米色、奶茶色配色方案
- 📱 **完全响应式** - 适配桌面、平板和移动设备
- 🖼️ **优雅的照片展示** - 支持分类浏览和灯箱效果
- ⚡ **流畅动画** - 使用 Framer Motion 实现丝滑的交互动画
- 🧭 **友好导航** - 清晰的面包屑导航和分页功能
- 🎯 **SEO 优化** - 良好的结构化数据和元标签

## 🚀 快速开始

### 环境要求

- Node.js (版本 16 或更高)
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone <your-repo-url>
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


## 📁 项目结构

```
photo-site/
├── public/                 # 静态文件
│   ├── images/            # 示例图片
│   └── index.html         # HTML 模板
├── src/
│   ├── components/        # 可复用组件
│   │   ├── Navigation.tsx    # 导航栏组件
│   │   ├── Lightbox.tsx      # 图片灯箱组件
│   │   ├── PhotoCard.tsx     # 照片卡片组件
│   │   ├── Pagination.tsx    # 分页组件
│   │   ├── Breadcrumb.tsx    # 面包屑导航
│   │   ├── ScrollToTop.tsx   # 返回顶部按钮
│   │   └── Loading.tsx       # 加载动画组件
│   ├── pages/             # 页面组件
│   │   ├── HomePage.tsx      # 首页
│   │   └── CategoryPage.tsx  # 分类页面
│   ├── hooks/             # 自定义 Hook
│   │   ├── useImageLoader.ts # 图片加载钩子
│   │   └── useScrollToTop.ts # 滚动到顶部钩子
│   ├── data/              # 数据文件
│   │   └── photos.ts         # 照片数据配置
│   ├── types/             # TypeScript 类型定义
│   │   └── index.ts          # 全局类型
│   ├── App.tsx            # 应用主组件
│   ├── index.tsx          # 应用入口
│   └── index.css          # 全局样式
├── tailwind.config.js     # Tailwind CSS 配置
├── postcss.config.js      # PostCSS 配置
└── package.json           # 项目依赖
```

## 🎨 个性化定制指南

### 1. 修改网站基本信息

#### 更改网站标题和 Logo
编辑 `src/components/Navigation.tsx`:
```tsx
// 第 30-36 行附近
<span className="font-serif text-2xl font-bold bg-gradient-to-r from-warm-800 to-warm-600 bg-clip-text text-transparent">
  你的网站名称  {/* 修改这里 */}
</span>
<span className="text-xs text-warm-500 font-medium tracking-wide">
  YOUR TAGLINE  {/* 修改这里 */}
</span>
```

#### 更改首页文案
编辑 `src/pages/HomePage.tsx`:
```tsx
// Hero 区域的标题和描述
<h1 className="text-5xl md:text-7xl font-serif font-bold bg-gradient-to-r from-warm-900 via-warm-700 to-warm-800 bg-clip-text text-transparent mb-6 relative">
  你的网站标题  {/* 修改这里 */}
</h1>
<p className="text-xl md:text-2xl text-warm-700 mb-10 max-w-4xl mx-auto leading-relaxed font-light">
  你的网站描述文字  {/* 修改这里 */}
</p>
```

### 2. 添加你的照片

#### 准备照片文件
1. 将你的照片放入 `public/images/` 文件夹
2. 建议图片尺寸：
   - 封面图：1200x800px
   - 作品图：1920x1080px 或更高
   - 格式：JPG、PNG、WebP

#### 配置照片数据
编辑 `src/data/photos.ts`:

```typescript
export const photoCategories: PhotoCategory[] = [
  {
    id: 'your-category-id',
    name: '你的分类名称',
    description: '分类描述文字',
    coverImage: '/images/your-cover-image.jpg',
    totalCount: 12, // 该分类下的照片总数
  },
  // 添加更多分类...
];

export const photosByCategory: Record<string, Photo[]> = {
  'your-category-id': [
    {
      id: '1',
      title: '照片标题',
      description: '照片描述',
      url: '/images/your-photo.jpg',
      category: 'your-category-id',
      tags: ['标签1', '标签2'],
      location: '拍摄地点',
      date: '2024-01-01',
      camera: '相机型号',
      lens: '镜头信息',
      settings: 'f/2.8, 1/125s, ISO 100',
    },
    // 添加更多照片...
  ],
};
```

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
项目已内置图片懒加载，可在 `src/hooks/useImageLoader.ts` 中调整配置

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

## 📦 构建和部署

### 构建生产版本
```bash
npm run build
```

### 部署选项

1. **静态托管** (推荐)
   - **Vercel**: 连接 GitHub 仓库，自动部署
   - **Netlify**: 拖拽 build 文件夹或连接 Git
   - **GitHub Pages**: 免费静态网站托管

2. **传统主机**
   - 上传 `build` 文件夹到服务器
   - 配置 Web 服务器指向 index.html

3. **Docker 部署**
```dockerfile
FROM nginx:alpine
COPY build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 环境变量配置
如需配置 API 密钥等，在根目录创建 `.env` 文件：
```
REACT_APP_API_KEY=your-api-key
REACT_APP_BASE_URL=https://your-domain.com
```

## 🔧 常见问题

### Q: 如何添加更多照片字段？
A: 在 `src/types/index.ts` 中修改 `Photo` 接口，然后更新相关组件显示新字段

### Q: 如何修改分页数量？
A: 在 `src/data/photos.ts` 中修改 `PHOTOS_PER_PAGE` 常量

### Q: 如何添加搜索功能？
A: 可以创建搜索组件，通过照片的 `tags`、`title` 等字段进行筛选

### Q: 如何优化 SEO？
A: 修改 `public/index.html` 中的 meta 标签，为每个页面添加合适的标题和描述

### Q: 照片加载慢怎么办？
A: 1. 压缩图片文件大小 2. 使用 WebP 格式 3. 考虑使用 CDN 服务

### Q: 如何修改网站图标？
A: 替换 `public/favicon.ico` 文件

### Q: 如何添加联系页面？
A: 1. 在 `src/pages/` 创建 `ContactPage.tsx` 2. 在路由中添加新页面 3. 更新导航菜单

## 🎨 设计系统

### 色彩规范
- **主色调**: warm 系列 (米色、棕色)
- **辅助色**: cream 系列 (奶色、金色)
- **功能色**: 
  - 成功: green-500
  - 警告: yellow-500
  - 错误: red-500

### 间距规范
- **小间距**: 4px (space-1)
- **中等间距**: 16px (space-4)
- **大间距**: 32px (space-8)
- **超大间距**: 64px (space-16)

### 字体规范
- **大标题**: text-4xl ~ text-7xl
- **小标题**: text-xl ~ text-2xl
- **正文**: text-sm ~ text-lg
- **说明文字**: text-xs

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 贡献指南
1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 发起 Pull Request

## 📄 许可证

MIT License - 可自由使用和修改

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
