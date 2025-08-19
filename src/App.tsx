import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ScrollToTop from './components/ScrollToTop';
import './App.css';

function App() {
  return (
    <Router basename="/photo-site">
      <div className="min-h-screen bg-gradient-to-br from-warm-50 to-cream-100">
        <Navigation />
        
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/category/:categoryId" element={<CategoryPage />} />
          </Routes>
        </main>
        
        <ScrollToTop />
        
        {/* Footer */}
        <footer className="bg-warm-900 text-warm-100 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-8">
              <h3 className="text-2xl font-serif font-semibold mb-4">照片分享</h3>
              <p className="text-warm-300 max-w-2xl mx-auto">
                分享生活中的美好时光，用照片记录珍贵的回忆
              </p>
            </div>
            
            <div className="border-t border-warm-700 pt-8">
              <p className="text-warm-400">
                © 2024 照片分享. 版权所有
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
