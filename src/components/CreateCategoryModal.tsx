import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreateCategoryData } from '../types';
import Toast from './Toast';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryData) => Promise<void>;
}

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: '',
    nameEn: '',
    description: '',
    coverImage: undefined,
    icon: '',
    sortWeight: 0
  });
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false
  });

  const handleInputChange = (field: keyof CreateCategoryData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileSelect = (file: File) => {
    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setToast({
        message: '请选择正确的图片格式 (JPG, PNG, WebP, GIF)',
        type: 'error',
        visible: true
      });
      return;
    }

    // 验证文件大小 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setToast({
        message: '图片大小不能超过 10MB',
        type: 'error',
        visible: true
      });
      return;
    }

    setFormData(prev => ({ ...prev, coverImage: file }));
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      handleFileSelect(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '请输入分类名称';
    }
    
    if (!formData.nameEn?.trim()) {
      newErrors.nameEn = '请输入英文名称';
    } else if (!/^[a-zA-Z\s-]+$/.test(formData.nameEn)) {
      newErrors.nameEn = '英文名称只能包含字母、空格和连字符';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = '请输入分类描述';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // 重置表单
      setFormData({
        name: '',
        nameEn: '',
        description: '',
        coverImage: undefined,
        icon: '',
        sortWeight: 0
      });
      setCoverPreview('');
      
      // 显示成功提示
      setToast({
        message: '分类创建成功！',
        type: 'success',
        visible: true
      });
      
      // 延迟关闭模态框
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('创建分类失败:', error);
      setToast({
        message: '创建分类失败，请重试',
        type: 'error',
        visible: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={handleClose}
          />
          
          {/* 模态框内容 */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 标题栏 */}
              <div className="bg-gradient-to-r from-warm-500 to-cream-500 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">新建分类</h2>
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

              {/* 表单内容 */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                {/* 分类名称 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      分类名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-warm-500 transition-colors ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="如：风景摄影"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      英文名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nameEn}
                      onChange={(e) => handleInputChange('nameEn', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-warm-500 transition-colors ${
                        errors.nameEn ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="如：landscape"
                    />
                    {errors.nameEn && <p className="text-red-500 text-sm mt-1">{errors.nameEn}</p>}
                  </div>
                </div>

                {/* 分类描述 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    分类描述 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-warm-500 transition-colors resize-none ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="描述这个分类的内容..."
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                {/* 封面图片上传 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    封面图片
                  </label>
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 relative ${
                      isDragOver 
                        ? 'border-warm-500 bg-warm-50' 
                        : 'border-gray-300 hover:border-warm-400'
                    }`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    {coverPreview ? (
                      <div className="relative">
                        <img
                          src={coverPreview}
                          alt="封面预览"
                          className="mx-auto max-h-48 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setCoverPreview('');
                            setFormData(prev => ({ ...prev, coverImage: undefined }));
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div>
                        <svg className={`mx-auto h-12 w-12 transition-colors ${
                          isDragOver ? 'text-warm-500' : 'text-gray-400'
                        }`} stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className={`mt-2 text-sm transition-colors ${
                          isDragOver ? 'text-warm-700' : 'text-gray-600'
                        }`}>
                          {isDragOver ? (
                            <span className="font-medium">松开鼠标上传图片</span>
                          ) : (
                            <>
                              <label className="font-medium text-warm-600 hover:text-warm-500 cursor-pointer">
                                点击上传
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleCoverImageChange}
                                  className="sr-only"
                                />
                              </label>
                              {' '}或拖拽图片到此处
                            </>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">PNG、JPG、WebP、GIF 格式，文件大小不超过 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 排序权重 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    排序权重
                  </label>
                  <input
                    type="number"
                    value={formData.sortWeight}
                    onChange={(e) => handleInputChange('sortWeight', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-warm-500 transition-colors"
                    placeholder="数字越大排序越靠前"
                  />
                </div>

                {/* 操作按钮 */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
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
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-warm-600 text-white rounded-lg hover:bg-warm-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {isSubmitting && (
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isSubmitting ? '创建中...' : '创建分类'}
                  </button>
                </div>
              </form>
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

export default CreateCategoryModal;
