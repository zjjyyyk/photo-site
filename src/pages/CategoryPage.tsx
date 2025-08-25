import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCategoryById, getPaginatedPhotos } from '../data/photos';
import { Photo, LightboxState, UploadPhoto, PhotoCategory } from '../types';
import PhotoCard from '../components/PhotoCard';
import Lightbox from '../components/Lightbox';
import Pagination from '../components/Pagination';
import Breadcrumb from '../components/Breadcrumb';
import UploadPhotosModal from '../components/UploadPhotosModal';
import { PhotoGridSkeleton } from '../components/Loading';
import { uploadService } from '../services/uploadService';
import SmartImage from '../components/SmartImage';

const isEditMode = false;

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(true); // 添加数据加载状态
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [category, setCategory] = useState<PhotoCategory | null>(null);
  const [paginatedData, setPaginatedData] = useState<any>(null);
  const [lightbox, setLightbox] = useState<LightboxState>({
    isOpen: false,
    currentPhotoIndex: 0,
    photos: []
  });

  // 加载分类数据
  const loadCategoryData = async () => {
    if (!categoryId) return null;
    
    const cat = await getCategoryById(categoryId);
    const paginated = await getPaginatedPhotos(categoryId, currentPage, 50);
    
    setCategory(cat || null);
    setPaginatedData(paginated);
    
    return cat; // 返回分类数据用于判断
  };

  useEffect(() => {
    console.log('CategoryPage useEffect triggered:', { categoryId, currentPage });
    
    const loadData = async () => {
      setIsDataLoading(true); // 开始数据加载
      
      const foundCategory = await loadCategoryData();
      
      console.log('Found category:', foundCategory);
      
      setIsDataLoading(false); // 数据加载完成
      
      if (!foundCategory) {
        console.log('Category not found, redirecting to home');
        navigate('/');
        return;
      }

      console.log('Category found, setting loading state');
      // 模拟加载时间
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800);

      return () => clearTimeout(timer);
    };
    
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, currentPage, navigate]);

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

  const handleUploadPhotos = async (photos: UploadPhoto[]) => {
    if (!categoryId) return;
    
    try {
      await uploadService.uploadPhotos(categoryId, photos, (progress) => {
        console.log('上传进度:', progress);
      });
      
      // 上传完成后重新加载数据
      await loadCategoryData();
    } catch (error) {
      console.error('上传失败:', error);
      throw error;
    }
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

  // 如果正在加载数据，显示加载状态
  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warm-50 to-cream-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warm-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-warm-800">加载中...</h2>
        </div>
      </div>
    );
  }

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
          className="text-center mb-12 relative"
        >
          {/* 上传按钮 - 已隐藏 */}
          {isEditMode  && (
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
          )}

          <div className="relative inline-block mb-6">
            <SmartImage
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
            {paginatedData.photos.map((photo: Photo, index: number) => {
              console.log('CategoryPage 渲染照片:', photo.id, photo.title, photo.url);
              return (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  onClick={() => handlePhotoClick(photo, index)}
                />
              );
            })}
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

      {/* 上传照片模态框 */}
      <UploadPhotosModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={handleUploadPhotos}
        categoryName={category?.name || ''}
      />
    </div>
  );
};

export default CategoryPage;
