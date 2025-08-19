import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`}>
      {/* 首页链接 */}
      <Link
        to="/"
        className="flex items-center text-warm-600 hover:text-warm-800 transition-colors"
      >
        <span className="text-base">🏠</span>
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          {/* 分隔符 */}
          <span className="text-warm-400">›</span>
          
          {/* 面包屑项 */}
          {item.path && index < items.length - 1 ? (
            <Link
              to={item.path}
              className="text-warm-600 hover:text-warm-800 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-warm-800 font-medium"
            >
              {item.label}
            </motion.span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
