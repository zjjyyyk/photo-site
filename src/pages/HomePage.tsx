import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { photoCategories } from '../data/photos';
import { useImageLoader } from '../hooks';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    description: string;
    coverImage: string;
    totalCount: number;
  };
  index: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, index }) => {
  const { loaded } = useImageLoader(category.coverImage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group"
    >
      <Link to={`/category/${category.id}`}>
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform group-hover:scale-[1.02]">
          {/* 背景图片 */}
          <div className="relative aspect-[4/3] overflow-hidden">
            {!loaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-warm-100 to-warm-200 animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-warm-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            <img
              src={category.coverImage}
              alt={category.name}
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                loaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
            
            {/* 渐变遮罩 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            
            {/* 悬停效果 */}
            <div className="absolute inset-0 bg-warm-600/0 group-hover:bg-warm-600/10 transition-all duration-500"></div>
          </div>

          {/* 白色内容卡片 */}
          <div className="bg-gradient-to-br from-white to-warm-50/30 p-6 relative">
            {/* 顶部装饰线 */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-warm-400 to-cream-400"></div>
            
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-serif font-semibold text-warm-900 group-hover:text-warm-700 transition-colors">
                {category.name}
              </h3>
              <div className="flex items-center space-x-1 px-3 py-1 bg-warm-100 rounded-full border border-warm-200">
                <span className="text-warm-600 text-xs">📷</span>
                <span className="text-warm-700 text-sm font-medium">{category.totalCount}</span>
              </div>
            </div>
            
            <p className="text-warm-600 text-sm mb-4 line-clamp-2 leading-relaxed">
              {category.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-warm-500 text-sm group-hover:text-warm-600 transition-colors">
                <span className="mr-2">👁</span>
                <span className="font-medium">查看作品集</span>
              </div>
              
              {/* 箭头指示器 */}
              <div className="w-8 h-8 rounded-full bg-warm-100 group-hover:bg-warm-200 flex items-center justify-center transition-all duration-300 group-hover:translate-x-1 border border-warm-200">
                <span className="text-warm-600 text-sm">→</span>
              </div>
            </div>
          </div>

          {/* 装饰元素 */}
          <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0 border border-white/30">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="text-white"
            >
              <span className="text-lg">📷</span>
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 via-cream-50 to-warm-100 relative overflow-hidden">
      {/* 背景装饰元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-warm-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-60 right-20 w-96 h-96 bg-cream-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-warm-300/20 rounded-full blur-3xl"></div>
      </div>

      {/* Hero 区域 */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* 标题装饰 */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8">
              <div className="w-20 h-1 bg-gradient-to-r from-warm-400 to-cream-400 rounded-full"></div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif font-bold bg-gradient-to-r from-warm-900 via-warm-700 to-warm-800 bg-clip-text text-transparent mb-6 relative">
              照片分享
              {/* 文字装饰 */}
              <div className="absolute -top-2 -right-4 w-8 h-8 text-warm-400/60 text-2xl">✨</div>
            </h1>
            
            <p className="text-xl md:text-2xl text-warm-700 mb-10 max-w-4xl mx-auto leading-relaxed font-light">
              分享生活中的美好时光，每一张照片都是珍贵的回忆
            </p>
            
            {/* 统计信息卡片 */}
            <div className="flex items-center justify-center space-x-12 mb-8">
              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-warm-200/50"
              >
                <div className="text-3xl font-bold text-warm-800 mb-2">
                  {photoCategories.reduce((total, category) => total + category.totalCount, 0)}
                </div>
                <div className="text-sm text-warm-600 font-medium tracking-wide">精选作品</div>
              </motion.div>
              
              <div className="w-px h-16 bg-gradient-to-b from-warm-300 to-transparent"></div>
              
              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-warm-200/50"
              >
                <div className="text-3xl font-bold text-warm-800 mb-2">{photoCategories.length}</div>
                <div className="text-sm text-warm-600 font-medium tracking-wide">主题分类</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 分类展示区域 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-warm-900 mb-4">
              照片分类
            </h2>
            <p className="text-lg text-warm-700 max-w-2xl mx-auto">
              浏览不同主题的照片，感受生活的美好瞬间
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {photoCategories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 底部装饰 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-warm-100/50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <h3 className="text-2xl font-serif font-semibold text-warm-900 mb-4">
              "记录生活的美好瞬间"
            </h3>
            <p className="text-warm-700 text-lg">
              每一张照片都记录着生活中的点点滴滴，分享这些珍贵的回忆让生活更加精彩
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
