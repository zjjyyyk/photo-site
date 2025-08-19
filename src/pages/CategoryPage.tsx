import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCategoryById, getPaginatedPhotos } from '../data/photos';
import { Photo, LightboxState } from '../types';
import PhotoCard from '../components/PhotoCard';
import Lightbox from '../components/Lightbox';
import Pagination from '../components/Pagination';
import Breadcrumb from '../components/Breadcrumb';
import { PhotoGridSkeleton } from '../components/Loading';

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [lightbox, setLightbox] = useState<LightboxState>({
    isOpen: false,
    currentPhotoIndex: 0,
    photos: []
  });

  const category = categoryId ? getCategoryById(categoryId) : null;
  const paginatedData = categoryId ? getPaginatedPhotos(categoryId, currentPage, 50) : null;

  useEffect(() => {
    if (!category) {
      navigate('/');
      return;
    }

    // 模拟加载时间
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [category, navigate, currentPage]);

  useEffect(() => {
    // 当分类变化时重置页码
    setCurrentPage(1);
  }, [categoryId]);

  const handlePhotoClick = (photo: Photo, index: number) => {
    if (!paginatedData) return;
    
    setLightbox({
      isOpen: true,
      currentPhotoIndex: index,
      photos: paginatedData.photos
    });
  };

  const handleLightboxClose = () => {
    setLightbox(prev => ({ ...prev, isOpen: false }));
  };

  const handleLightboxNext = () => {
    setLightbox(prev => ({
      ...prev,
      currentPhotoIndex: Math.min(prev.currentPhotoIndex + 1, prev.photos.length - 1)
    }));
  };

  const handleLightboxPrev = () => {
    setLightbox(prev => ({
      ...prev,
      currentPhotoIndex: Math.max(prev.currentPhotoIndex - 1, 0)
    }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!category || !paginatedData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warm-50 to-cream-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-warm-800 mb-4">分类不存在</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-warm-600 text-white rounded-lg hover:bg-warm-700 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: category.name }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 to-cream-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 面包屑导航 */}
        <Breadcrumb items={breadcrumbItems} className="mb-6" />

        {/* 分类头部 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="relative inline-block mb-6">
            <img
              src={category.coverImage}
              alt={category.name}
              className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-2xl shadow-lg"
            />
            <div className="absolute inset-0 bg-warm-600/20 rounded-2xl"></div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-warm-900 mb-4">
            {category.name}
          </h1>
          
          <p className="text-lg text-warm-700 mb-6 max-w-2xl mx-auto">
            {category.description}
          </p>
          
          <div className="flex items-center justify-center space-x-6 text-warm-600">
            <div className="flex items-center space-x-2">
              <span className="text-base">📷</span>
              <span className="font-medium">
                {category.totalCount} 张作品
              </span>
            </div>
            <div className="w-px h-6 bg-warm-300"></div>
            <div className="font-medium">
              第 {paginatedData.pagination.currentPage} / {paginatedData.pagination.totalPages} 页
            </div>
          </div>
        </motion.div>

        {/* 照片网格 */}
        {isLoading ? (
          <PhotoGridSkeleton count={12} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12"
          >
            {paginatedData.photos.map((photo, index) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onClick={() => handlePhotoClick(photo, index)}
              />
            ))}
          </motion.div>
        )}

        {/* 分页器 */}
        {!isLoading && paginatedData.pagination.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Pagination
              pagination={paginatedData.pagination}
              onPageChange={handlePageChange}
              className="mb-8"
            />
          </motion.div>
        )}

        {/* 空状态 */}
        {!isLoading && paginatedData.photos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <span className="text-6xl text-warm-400 block mb-4">📷</span>
            <h3 className="text-xl font-semibold text-warm-700 mb-2">
              暂无照片
            </h3>
            <p className="text-warm-600">
              这个分类下还没有照片，敬请期待
            </p>
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      <Lightbox
        isOpen={lightbox.isOpen}
        photos={lightbox.photos}
        currentIndex={lightbox.currentPhotoIndex}
        onClose={handleLightboxClose}
        onNext={handleLightboxNext}
        onPrev={handleLightboxPrev}
      />
    </div>
  );
};

export default CategoryPage;
