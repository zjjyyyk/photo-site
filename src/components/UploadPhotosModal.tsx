import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadPhoto } from '../types';
import Toast from './Toast';
import { ExifService } from '../services/exifService';

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

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (newFiles.length === 0) {
      setToast({
        message: '请选择有效的图片文件',
        type: 'error',
        visible: true
      });
      setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, 3000);
      return;
    }

    // 检查文件数量限制
    const totalFiles = photos.length + newFiles.length;
    if (totalFiles > 500) {
      setToast({
        message: `文件数量超过限制！当前已选择 ${photos.length} 个文件，最多可选择 500 个文件`,
        type: 'error',
        visible: true
      });
      setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, 5000);
      return;
    }

    // 检查文件大小限制（20MB = 20 * 1024 * 1024 bytes）
    const maxFileSize = 20 * 1024 * 1024;
    const oversizedFiles = newFiles.filter(file => file.size > maxFileSize);
    if (oversizedFiles.length > 0) {
      const oversizedNames = oversizedFiles.map(file => file.name).join(', ');
      setToast({
        message: `以下文件超过 20MB 限制：${oversizedNames}`,
        type: 'error',
        visible: true
      });
      setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, 5000);
      return;
    }
    
    // 显示加载提示
    setToast({
      message: '正在读取图片信息...',
      type: 'success',
      visible: true
    });
    
    try {
      // 串行处理文件以避免中文文件名的并发问题
      const newPhotos: UploadPhoto[] = [];
      
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        
        try {
          console.log(`处理文件 ${i + 1}/${newFiles.length}: ${file.name}`);
          
          // 生成标题（移除扩展名）
          const title = file.name.replace(/\.[^/.]+$/, '');
          
          // 创建预览URL
          const preview = URL.createObjectURL(file);
          
          // 提取 EXIF 数据
          console.log('开始提取EXIF数据...');
          const exifData = await ExifService.extractExifData(file);
          console.log('EXIF数据提取完成:', exifData);
          
          const photoData: UploadPhoto = {
            file,
            preview,
            title,
            description: '',
            tags: [],
            exif: exifData || {
              dateTaken: new Date().toISOString().split('T')[0]
            },
            location: exifData?.location || ''
          };
          
          newPhotos.push(photoData);
          console.log(`文件 ${file.name} 处理完成`);
          
        } catch (fileError) {
          console.error(`处理文件 ${file.name} 时出错:`, fileError);
          
          // 即使出错也添加文件，但使用默认数据
          const title = file.name.replace(/\.[^/.]+$/, '');
          
          newPhotos.push({
            file,
            preview: URL.createObjectURL(file),
            title,
            description: '',
            tags: [],
            exif: {
              dateTaken: new Date().toISOString().split('T')[0]
            },
            location: ''
          });
        }
      }
      
      setSelectedFiles(prev => [...prev, ...newFiles]);
      setPhotos(prev => [...prev, ...newPhotos]);
      
      // 显示成功提示
      const exifCount = newPhotos.filter(photo => 
        photo.exif && Object.keys(photo.exif).length > 1 // 检查是否有除了dateTaken之外的EXIF数据
      ).length;
      
      setToast({
        message: `成功添加 ${newFiles.length} 张图片，其中 ${exifCount} 张包含相机参数`,
        type: 'success',
        visible: true
      });
      
      // 3秒后隐藏提示
      setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, 3000);
      
    } catch (error) {
      console.error('Error processing files:', error);
      
      // 如果整体处理失败，使用原有的并行处理逻辑作为后备
      const newPhotos: UploadPhoto[] = newFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        title: file.name.replace(/\.[^/.]+$/, ''),
        description: '',
        tags: [],
        exif: {
          dateTaken: new Date().toISOString().split('T')[0]
        },
        location: ''
      }));
      
      setSelectedFiles(prev => [...prev, ...newFiles]);
      setPhotos(prev => [...prev, ...newPhotos]);
      
      setToast({
        message: `添加了 ${newFiles.length} 张图片，但无法读取相机参数`,
        type: 'error',
        visible: true
      });
      
      setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, 3000);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newSelectedFiles = selectedFiles.filter((_, i) => i !== index);
    
    setPhotos(newPhotos);
    setSelectedFiles(newSelectedFiles);
    
    // 删除后的索引逻辑：优先显示下一张
    if (newPhotos.length === 0) {
      // 如果删除后没有照片了，重置索引
      setCurrentPhotoIndex(0);
    } else if (index < currentPhotoIndex) {
      // 如果删除的是当前照片之前的，当前索引需要减1
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    } else if (index === currentPhotoIndex) {
      // 如果删除的是当前照片
      if (currentPhotoIndex >= newPhotos.length) {
        // 如果当前索引超出了新数组长度，显示最后一张
        setCurrentPhotoIndex(newPhotos.length - 1);
      }
      // 否则保持当前索引不变，这样就会显示下一张照片
    }
    // 如果删除的是当前照片之后的，索引不需要变化
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

    // 最终验证检查
    if (photos.length > 500) {
      setToast({
        message: '文件数量超过限制，最多上传 500 个文件',
        type: 'error',
        visible: true
      });
      setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, 5000);
      return;
    }

    const maxFileSize = 20 * 1024 * 1024;
    const oversizedFiles = photos.filter(photo => photo.file.size > maxFileSize);
    if (oversizedFiles.length > 0) {
      setToast({
        message: `存在超过 20MB 的文件，请重新选择`,
        type: 'error',
        visible: true
      });
      setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, 5000);
      return;
    }
    
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
      
      // 检查是否是服务器返回的详细错误信息
      let errorMessage = '上传失败，请重试';
      if (error instanceof Error) {
        const message = error.message;
        if (message.includes('文件太大') || message.includes('FILE_TOO_LARGE')) {
          errorMessage = '文件太大，单个文件限制为 20MB';
        } else if (message.includes('文件数量超过限制') || message.includes('TOO_MANY_FILES')) {
          errorMessage = '文件数量超过限制，最多上传 500 个文件';
        } else if (message.includes('文件格式不支持') || message.includes('INVALID_FILE_TYPE')) {
          errorMessage = '上传的文件格式不支持，请选择图片文件';
        } else if (message.length > 0) {
          errorMessage = message;
        }
      }
      
      setToast({
        message: errorMessage,
        type: 'error',
        visible: true
      });
      
      // 错误提示显示更长时间，但不关闭模态框
      setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, 5000);
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
                {/* 左侧：图片选择和预览 - 添加滚动功能 */}
                <div className="w-1/2 border-r border-gray-200 flex flex-col overflow-y-auto">
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
                    <div className="flex-1 flex flex-col relative">
                      {/* 当前图片预览 - 移除最大高度限制，让父容器处理滚动 */}
                      <div className="flex-1 p-4 flex items-center justify-center bg-gray-50 relative z-0">
                        {currentPhoto && (
                          <img
                            src={currentPhoto.preview}
                            alt={currentPhoto.title}
                            className="max-w-full h-auto object-contain rounded-lg shadow-lg"
                          />
                        )}
                      </div>
                      
                      {/* 图片缩略图列表 - 固定高度，确保始终可见 */}
                      <div className="p-4 border-t border-gray-200 bg-white relative z-50 flex-shrink-0 h-28 overflow-visible">
                        <div className="flex space-x-2 overflow-x-auto h-full items-center">
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
                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-[60]"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                          
                          {/* 添加更多按钮 */}
                          <div
                            className="flex-shrink-0 w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-warm-400 transition-colors relative z-[60]"
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
                            onClick={() => removePhoto(currentPhotoIndex)}
                            disabled={isSubmitting || photos.length === 0}
                            className="px-6 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            删除
                          </button>
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
