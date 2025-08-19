import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { photoCategories } from '../data/photos';

const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-warm-200/50 sticky top-0 z-50 shadow-lg shadow-warm-100/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 py-2">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 text-warm-800 hover:text-warm-600 transition-all duration-300 group"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-warm-400 to-cream-400 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
              <span className="text-white text-xl">📷</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold bg-gradient-to-r from-warm-800 to-warm-600 bg-clip-text text-transparent">
                照片分享
              </span>
              <span className="text-xs text-warm-500 font-medium tracking-wide">
                PHOTO SHARING
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-2">
              <Link
                to="/"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden group ${
                  isActive('/') 
                    ? 'text-white bg-gradient-to-r from-orange-500 to-orange-600 shadow-md' 
                    : 'text-orange-600 hover:text-orange-800 hover:bg-orange-50'
                }`}
              >
                <span className="relative z-10">首页</span>
                {!isActive('/') && (
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left opacity-0 group-hover:opacity-100"></div>
                )}
              </Link>
              
              {photoCategories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.id}`}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden group ${
                    isActive(`/category/${category.id}`)
                      ? 'text-white bg-gradient-to-r from-orange-500 to-orange-600 shadow-md'
                      : 'text-orange-600 hover:text-orange-800 hover:bg-orange-50'
                  }`}
                >
                  <span className="relative z-10">{category.name}</span>
                  {!isActive(`/category/${category.id}`) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left opacity-0 group-hover:opacity-100"></div>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-xl text-orange-600 hover:text-orange-800 hover:bg-orange-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              {isMobileMenuOpen ? (
                <span className="text-xl">✕</span>
              ) : (
                <span className="text-xl">☰</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-md border-t border-orange-200/50 shadow-lg"
          >
            <div className="px-4 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-orange-800 bg-orange-100' 
                    : 'text-orange-600 hover:text-orange-800 hover:bg-orange-50'
                }`}
              >
                首页
              </Link>
              
              {photoCategories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.id}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(`/category/${category.id}`)
                      ? 'text-orange-800 bg-orange-100'
                      : 'text-orange-600 hover:text-orange-800 hover:bg-orange-50'
                  }`}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;
