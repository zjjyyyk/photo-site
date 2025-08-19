import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollToTop } from '../hooks';

const ScrollToTop: React.FC = () => {
  const { showButton, scrollToTop } = useScrollToTop();

  return (
    <AnimatePresence>
      {showButton && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 p-3 bg-warm-600 text-white rounded-full shadow-lg hover:bg-warm-700 transition-colors"
          aria-label="返回顶部"
        >
          <span className="text-lg font-bold">↑</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;
