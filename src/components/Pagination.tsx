import React from 'react';
import { motion } from 'framer-motion';
import { PaginationInfo } from '../types';

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({ 
  pagination, 
  onPageChange, 
  className = '' 
}) => {
  const { currentPage, totalPages } = pagination;

  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage <= 4) {
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  const pageNumbers = generatePageNumbers();

  return (
    <div className={`flex items-center justify-center space-x-3 ${className}`}>
      {/* 上一页按钮 */}
      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center px-5 py-3 text-sm font-medium bg-white border-2 border-warm-200 rounded-xl hover:bg-warm-50 hover:border-warm-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-warm-200 transition-all duration-300 shadow-sm hover:shadow-md"
      >
        <span className="text-base mr-2 text-warm-600">‹</span>
        <span className="text-warm-700">上一页</span>
      </motion.button>

      {/* 页码按钮 */}
      <div className="flex space-x-2">
        {pageNumbers.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-4 py-3 text-warm-400 flex items-center">
                <span className="text-lg">⋯</span>
              </span>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPageChange(page as number)}
                className={`w-12 h-12 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-warm-500 to-warm-600 text-white shadow-lg shadow-warm-500/25'
                    : 'text-warm-600 bg-white border-2 border-warm-200 hover:bg-warm-50 hover:border-warm-300 hover:shadow-md'
                }`}
              >
                {page}
              </motion.button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* 下一页按钮 */}
      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center px-5 py-3 text-sm font-medium bg-white border-2 border-warm-200 rounded-xl hover:bg-warm-50 hover:border-warm-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-warm-200 transition-all duration-300 shadow-sm hover:shadow-md"
      >
        <span className="text-warm-700">下一页</span>
        <span className="text-base ml-2 text-warm-600">›</span>
      </motion.button>

      {/* 页面信息 */}
      <div className="ml-4 text-sm text-warm-600">
        第 {currentPage} 页，共 {totalPages} 页
      </div>
    </div>
  );
};

export default Pagination;
