import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Photo } from '../types';
import { useIntersectionObserver } from '../hooks';
import SmartImage from './SmartImage';

interface PhotoCardProps {
  photo: Photo;
  onClick: () => void;
  className?: string;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onClick, className = '' }) => {
  console.log('PhotoCard render:', {
    id: photo.id,
    title: photo.title,
    url: photo.url,
    thumbnailUrl: photo.thumbnailUrl,
    finalSrc: photo.thumbnailUrl || photo.url
  });
  
  const cardRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(cardRef, {
    threshold: 0.1,
    rootMargin: '50px'
  });

  // 让SmartImage自己管理加载状态
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`group cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="relative overflow-hidden rounded-lg bg-warm-100 shadow-md hover:shadow-xl transition-all duration-300">
        {/* 图片容器 */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {!loaded && (
            <div className="absolute inset-0 bg-warm-200 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-warm-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          <SmartImage
            src={photo.thumbnailUrl || photo.url}
            alt={photo.title}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
          />
          
          {/* 悬停遮罩 */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300">
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                <svg 
                  className="w-6 h-6 text-warm-800" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 照片信息 */}
        <div className="p-4">
          <h3 className="font-medium text-warm-800 mb-1 line-clamp-1">
            {photo.title}
          </h3>
          {photo.description && (
            <p className="text-sm text-warm-600 line-clamp-2 mb-2">
              {photo.description}
            </p>
          )}
          
          {/* 标签 */}
          <div className="flex flex-wrap gap-1">
            {photo.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-warm-100 text-warm-700 rounded-full"
              >
                {tag}
              </span>
            ))}
            {photo.tags.length > 3 && (
              <span className="px-2 py-1 text-xs bg-warm-100 text-warm-700 rounded-full">
                +{photo.tags.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PhotoCard;
