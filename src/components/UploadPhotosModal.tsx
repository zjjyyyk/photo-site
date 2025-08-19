import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadPhoto } from '../types';
import Toast from './Toast';

interface UploadPhotosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (photos: UploadPhoto[]) => Promise<void>;
  categoryName: string;
}

const UploadPhotosModal: React.FC<UploadPhotosModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categoryName
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [photos, setPhotos] = useState<UploadPhoto[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    // 创建预览和初始数据
    const newPhotos: UploadPhoto[] = newFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      title: file.name.replace(/\.[^/.]+$/, ''), // 移除扩展名
      description: '',
      tags: [],
      exif: {
        dateTaken: new Date().toISOString().split('T')[0]
      },
      location: ''
    }));
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    if (currentPhotoIndex >= index && currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  const updatePhoto = (index: number, updates: Partial<UploadPhoto>) => {
    setPhotos(prev => prev.map((photo, i) => 
      i === index ? { ...photo, ...updates } : photo
    ));
  };

  const addTag = (photoIndex: number, tag: string) => {
    if (tag.trim() && !photos[photoIndex].tags.includes(tag.trim())) {
      updatePhoto(photoIndex, {
        tags: [...photos[photoIndex].tags, tag.trim()]
      });
    }
  };

  const removeTag = (photoIndex: number, tagToRemove: string) => {
    updatePhoto(photoIndex, {
      tags: photos[photoIndex].tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (photos.length === 0) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(photos);
      // 重置状态
      setPhotos([]);
      setSelectedFiles([]);
      setCurrentPhotoIndex(0);
      setUploadProgress(0);
      
      // 显示成功提示
      setToast({
        message: `成功上传 ${photos.length} 张照片！`,
        type: 'success',
        visible: true
      });
      
      // 延迟关闭模态框
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('上传失败:', error);
      setToast({
        message: '上传失败，请重试',
        type: 'error',
        visible: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      // 清理对象URL
      photos.forEach(photo => URL.revokeObjectURL(photo.preview));
      setPhotos([]);
      setSelectedFiles([]);
      setCurrentPhotoIndex(0);
      setUploadProgress(0);
      onClose();
    }
  };

  const currentPhoto = photos[currentPhotoIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
            onClick={handleClose}
          />
          
          {/* 模态框内容 */}
          <div className="flex h-full">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="relative bg-white w-full max-w-6xl mx-auto my-4 rounded-lg shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 标题栏 */}
              <div className="bg-gradient-to-r from-warm-500 to-cream-500 px-6 py-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">
                    上传照片到 {categoryName}
                  </h2>
                  <button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="text-white hover:text-warm-100 transition-colors p-1"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 主要内容区域 */}
              <div className="flex-1 flex overflow-hidden">
                {/* 左侧：图片选择和预览 */}
                <div className="w-1/2 border-r border-gray-200 flex flex-col">
                  {/* 文件上传区域 */}
                  {photos.length === 0 ? (
                    <div
                      className="flex-1 flex items-center justify-center p-8"
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                    >
                      <div className="text-center">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 hover:border-warm-400 transition-colors">
                          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="text-xl font-medium text-gray-600 mb-2">
                            拖拽图片到此处
                          </p>
                          <p className="text-sm text-gray-500 mb-4">
                            支持 PNG、JPG、WebP 格式，可批量选择
                          </p>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-warm-600 text-white px-6 py-3 rounded-lg hover:bg-warm-700 transition-colors"
                          >
                            选择图片
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => handleFileSelect(e.target.files)}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col">
                      {/* 当前图片预览 */}
                      <div className="flex-1 p-4 flex items-center justify-center bg-gray-50">
                        {currentPhoto && (
                          <img
                            src={currentPhoto.preview}
                            alt={currentPhoto.title}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                          />
                        )}
                      </div>
                      
                      {/* 图片缩略图列表 */}
                      <div className="p-4 border-t border-gray-200">
                        <div className="flex space-x-2 overflow-x-auto">
                          {photos.map((photo, index) => (
                            <div
                              key={index}
                              className={`relative flex-shrink-0 w-20 h-20 cursor-pointer rounded-lg overflow-hidden border-2 ${
                                index === currentPhotoIndex 
                                  ? 'border-warm-500' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setCurrentPhotoIndex(index)}
                            >
                              <img
                                src={photo.preview}
                                alt={photo.title}
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removePhoto(index);
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                          
                          {/* 添加更多按钮 */}
                          <div
                            className="flex-shrink-0 w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-warm-400 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 右侧：图片信息编辑 */}
                <div className="w-1/2 p-6 overflow-y-auto">
                  {currentPhoto && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* 图片信息 */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          图片信息 ({currentPhotoIndex + 1}/{photos.length})
                        </h3>
                        
                        {/* 标题 */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            图片标题
                          </label>
                          <input
                            type="text"
                            value={currentPhoto.title}
                            onChange={(e) => updatePhoto(currentPhotoIndex, { title: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-warm-500 transition-colors"
                            placeholder="为这张照片起个标题"
                          />
                        </div>

                        {/* 描述 */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            图片描述
                          </label>
                          <textarea
                            value={currentPhoto.description}
                            onChange={(e) => updatePhoto(currentPhotoIndex, { description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-warm-500 transition-colors resize-none"
                            placeholder="描述这张照片的故事..."
                          />
                        </div>

                        {/* 标签 */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            标签
                          </label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {currentPhoto.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="bg-warm-100 text-warm-800 px-3 py-1 rounded-full text-sm flex items-center"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeTag(currentPhotoIndex, tag)}
                                  className="ml-2 text-warm-600 hover:text-warm-800"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </span>
                            ))}
                          </div>
                          <input
                            type="text"
                            placeholder="输入标签后按回车添加"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-warm-500 transition-colors"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const input = e.currentTarget;
                                addTag(currentPhotoIndex, input.value);
                                input.value = '';
                              }
                            }}
                          />
                        </div>

                        {/* 拍摄信息 */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              相机型号
                            </label>
                            <input
                              type="text"
                              value={currentPhoto.exif?.camera || ''}
                              onChange={(e) => updatePhoto(currentPhotoIndex, {
                                exif: { ...currentPhoto.exif, camera: e.target.value }
                              })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-warm-500 transition-colors"
                              placeholder="如：Canon EOS R5"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              镜头
                            </label>
                            <input
                              type="text"
                              value={currentPhoto.exif?.lens || ''}
                              onChange={(e) => updatePhoto(currentPhotoIndex, {
                                exif: { ...currentPhoto.exif, lens: e.target.value }
                              })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-warm-500 transition-colors"
                              placeholder="如：24-70mm f/2.8"
                            />
                          </div>
                        </div>

                        {/* 拍摄参数 */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              ISO
                            </label>
                            <input
                              type="number"
                              value={currentPhoto.exif?.iso || ''}
                              onChange={(e) => updatePhoto(currentPhotoIndex, {
                                exif: { ...currentPhoto.exif, iso: parseInt(e.target.value) || undefined }
                              })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-warm-500 transition-colors"
                              placeholder="100"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              光圈
                            </label>
                            <input
                              type="text"
                              value={currentPhoto.exif?.aperture || ''}
                              onChange={(e) => updatePhoto(currentPhotoIndex, {
                                exif: { ...currentPhoto.exif, aperture: e.target.value }
                              })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-warm-500 transition-colors"
                              placeholder="f/2.8"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              快门
                            </label>
                            <input
                              type="text"
                              value={currentPhoto.exif?.shutterSpeed || ''}
                              onChange={(e) => updatePhoto(currentPhotoIndex, {
                                exif: { ...currentPhoto.exif, shutterSpeed: e.target.value }
                              })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-warm-500 transition-colors"
                              placeholder="1/125s"
                            />
                          </div>
                        </div>

                        {/* 拍摄日期和地点 */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              拍摄日期
                            </label>
                            <input
                              type="date"
                              value={currentPhoto.exif?.dateTaken || ''}
                              onChange={(e) => updatePhoto(currentPhotoIndex, {
                                exif: { ...currentPhoto.exif, dateTaken: e.target.value }
                              })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-warm-500 transition-colors"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              拍摄地点
                            </label>
                            <input
                              type="text"
                              value={currentPhoto.location || ''}
                              onChange={(e) => updatePhoto(currentPhotoIndex, { location: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-warm-500 transition-colors"
                              placeholder="如：青岛海滨"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 上传进度 */}
                      {isSubmitting && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>上传进度</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-warm-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* 操作按钮 */}
                      <div className="flex justify-between">
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => setCurrentPhotoIndex(Math.max(0, currentPhotoIndex - 1))}
                            disabled={currentPhotoIndex === 0}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                          >
                            上一张
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrentPhotoIndex(Math.min(photos.length - 1, currentPhotoIndex + 1))}
                            disabled={currentPhotoIndex === photos.length - 1}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                          >
                            下一张
                          </button>
                        </div>
                        
                        <div className="flex space-x-3">
                          <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                          >
                            取消
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting || photos.length === 0}
                            className="px-6 py-2 bg-warm-600 text-white rounded-lg hover:bg-warm-700 transition-colors disabled:opacity-50 flex items-center"
                          >
                            {isSubmitting && (
                              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            )}
                            {isSubmitting ? '上传中...' : `上传 ${photos.length} 张照片`}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* 隐藏的文件输入 */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </motion.div>
          </div>
          
          {/* Toast 提示 */}
          <Toast
            message={toast.message}
            type={toast.type}
            isVisible={toast.visible}
            onClose={() => setToast(prev => ({ ...prev, visible: false }))}
          />
        </div>
      )}
    </AnimatePresence>
  );
};

export default UploadPhotosModal;
