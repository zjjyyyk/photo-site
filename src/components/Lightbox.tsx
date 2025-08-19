import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Photo } from '../types';

interface LightboxProps {
  isOpen: boolean;
  photos: Photo[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({
  isOpen,
  photos,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}) => {
  const currentPhoto = photos[currentIndex];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        onPrev();
        break;
      case 'ArrowRight':
        onNext();
        break;
    }
  }, [isOpen, onClose, onNext, onPrev]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleShare = async () => {
    if (navigator.share && currentPhoto) {
      try {
        await navigator.share({
          title: currentPhoto.title,
          text: currentPhoto.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('分享失败:', error);
      }
    }
  };

  const handleDownload = () => {
    if (currentPhoto) {
      const link = document.createElement('a');
      link.href = currentPhoto.url;
      link.download = `${currentPhoto.title}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!currentPhoto) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-gradient-to-br from-black/95 to-warm-900/90 backdrop-blur-md"
          onClick={onClose}
        >
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:text-warm-300 hover:bg-white/20 transition-all duration-300 group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform duration-300">✕</span>
          </button>

          {/* 导航按钮 */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPrev();
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-10 w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:text-warm-300 hover:bg-white/20 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group"
                disabled={currentIndex === 0}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">‹</span>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNext();
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-10 w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:text-warm-300 hover:bg-white/20 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group"
                disabled={currentIndex === photos.length - 1}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">›</span>
              </button>
            </>
          )}

          {/* 图片容器 */}
          <div 
            className="flex items-center justify-center h-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              key={currentIndex}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative max-w-7xl max-h-full"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <img
                  src={currentPhoto.url}
                  alt={currentPhoto.title}
                  className="max-w-full max-h-full object-contain rounded-2xl"
                />
                {/* 微妙的装饰边框 */}
                <div className="absolute inset-0 rounded-2xl border-2 border-gradient-to-br from-warm-400/20 to-cream-400/20 pointer-events-none"></div>
              </div>
            </motion.div>
          </div>

          {/* 照片信息面板 */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent backdrop-blur-lg text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-7xl mx-auto p-8">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-serif font-semibold mb-3 text-warm-100">{currentPhoto.title}</h2>
                  {currentPhoto.description && (
                    <p className="text-warm-200 mb-4 leading-relaxed text-lg">{currentPhoto.description}</p>
                  )}
                  
                  {/* 标签 */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {currentPhoto.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 text-sm bg-warm-500/30 backdrop-blur-sm border border-warm-400/30 rounded-full text-warm-100 hover:bg-warm-500/40 transition-all duration-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* EXIF 信息 */}
                  {currentPhoto.exif && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <h3 className="text-sm font-semibold text-warm-200 mb-3 tracking-wide uppercase">拍摄参数</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                        {currentPhoto.exif.camera && (
                          <div className="text-center">
                            <div className="text-warm-300 font-medium mb-1">相机</div>
                            <div className="text-white">{currentPhoto.exif.camera}</div>
                          </div>
                        )}
                        {currentPhoto.exif.lens && (
                          <div className="text-center">
                            <div className="text-warm-300 font-medium mb-1">镜头</div>
                            <div className="text-white">{currentPhoto.exif.lens}</div>
                          </div>
                        )}
                        {currentPhoto.exif.aperture && (
                          <div className="text-center">
                            <div className="text-warm-300 font-medium mb-1">光圈</div>
                            <div className="text-white">{currentPhoto.exif.aperture}</div>
                          </div>
                        )}
                        {currentPhoto.exif.shutterSpeed && (
                          <div className="text-center">
                            <div className="text-warm-300 font-medium mb-1">快门</div>
                            <div className="text-white">{currentPhoto.exif.shutterSpeed}</div>
                          </div>
                        )}
                        {currentPhoto.exif.iso && (
                          <div className="text-center">
                            <div className="text-warm-300 font-medium mb-1">ISO</div>
                            <div className="text-white">{currentPhoto.exif.iso}</div>
                          </div>
                        )}
                        {currentPhoto.exif.focalLength && (
                          <div className="text-center">
                            <div className="text-warm-300 font-medium mb-1">焦距</div>
                            <div className="text-white">{currentPhoto.exif.focalLength}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 操作按钮 */}
                <div className="flex flex-col space-y-3 ml-6">
                  <button
                    onClick={handleShare}
                    className="w-12 h-12 bg-warm-500/30 hover:bg-warm-500/50 backdrop-blur-sm border border-warm-400/30 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105 group"
                    title="分享"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform duration-300">📤</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="w-12 h-12 bg-warm-500/30 hover:bg-warm-500/50 backdrop-blur-sm border border-warm-400/30 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105 group"
                    title="下载"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform duration-300">💾</span>
                  </button>
                </div>
              </div>

              {/* 页码指示器 */}
              {photos.length > 1 && (
                <div className="flex items-center justify-center mt-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 border border-white/30">
                    <span className="text-warm-200 text-sm font-medium">
                      {currentIndex + 1} / {photos.length}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Lightbox;
