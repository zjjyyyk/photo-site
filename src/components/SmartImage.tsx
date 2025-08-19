import React, { useState, useEffect } from 'react';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * 智能图片组件
 * 直接使用前端静态资源，因为上传时已经在本地保存了一份
 */
const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  className = '',
  loading = 'lazy',
  onLoad,
  onError
}) => {
  console.log('SmartImage render:', { src, alt });
  
  const [currentSrc, setCurrentSrc] = useState<string>('');

  useEffect(() => {
    // 检查src是否为空
    if (!src || src.trim() === '') {
      console.warn('SmartImage: src为空');
      setCurrentSrc('');
      return;
    }
    
    // 直接使用前端静态资源，因为上传时已经在本地保存了一份
    if (src.startsWith('/images/')) {
      const frontendSrc = `/photo-site/images/${src.replace('/images/', '')}`;
      console.log('SmartImage: 使用前端静态资源:', frontendSrc);
      setCurrentSrc(frontendSrc);
    } else {
      setCurrentSrc(src);
    }
  }, [src]);

  const handleError = () => {
    console.log('SmartImage: 图片加载失败:', currentSrc);
    onError?.();
  };

  const handleLoad = () => {
    console.log('SmartImage: 图片加载成功:', currentSrc);
    onLoad?.();
  };

  // 如果没有有效的src，不渲染img标签
  if (!currentSrc || currentSrc.trim() === '') {
    return null;
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading={loading}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
};

export default SmartImage;
