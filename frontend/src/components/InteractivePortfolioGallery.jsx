import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  ViewColumnsIcon,
  Squares2X2Icon,
  RectangleGroupIcon,
  HeartIcon,
  ShareIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ArrowsPointingOutIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useInView } from 'react-intersection-observer';

const InteractivePortfolioGallery = ({ items = [], categories = [] }) => {
  // View modes
  const [viewMode, setViewMode] = useState('grid'); // grid, masonry, carousel
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [likedItems, setLikedItems] = useState(() => {
    const saved = localStorage.getItem('likedPortfolioItems');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Refs
  const carouselRef = useRef(null);
  const autoPlayInterval = useRef(null);
  
  // Filter and search items
  const filteredItems = useMemo(() => {
    let filtered = items;
    
    if (filter !== 'all') {
      filtered = filtered.filter(item => item.category === filter);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [items, filter, searchQuery]);
  
  // Handle like/unlike
  const toggleLike = useCallback((itemId) => {
    setLikedItems(prev => {
      const newLiked = prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId];
      localStorage.setItem('likedPortfolioItems', JSON.stringify(newLiked));
      return newLiked;
    });
  }, []);
  
  // Share item
  const shareItem = useCallback((item) => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.description,
        url: window.location.href + '#portfolio-' + item.id
      });
    } else {
      // Fallback to copy link
      navigator.clipboard.writeText(window.location.href + '#portfolio-' + item.id);
      // Show toast notification
      alert('تم نسخ الرابط!');
    }
  }, []);
  
  // Auto-play carousel
  useEffect(() => {
    if (viewMode === 'carousel' && isAutoPlay) {
      autoPlayInterval.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % filteredItems.length);
      }, 3000);
    } else {
      clearInterval(autoPlayInterval.current);
    }
    
    return () => clearInterval(autoPlayInterval.current);
  }, [viewMode, isAutoPlay, filteredItems.length]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedItem) {
        if (e.key === 'Escape') {
          setSelectedItem(null);
        } else if (e.key === 'ArrowLeft') {
          navigateItem(-1);
        } else if (e.key === 'ArrowRight') {
          navigateItem(1);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, filteredItems]);
  
  // Navigate between items in lightbox
  const navigateItem = (direction) => {
    const currentIdx = filteredItems.findIndex(item => item.id === selectedItem.id);
    let newIdx = currentIdx + direction;
    
    if (newIdx < 0) newIdx = filteredItems.length - 1;
    if (newIdx >= filteredItems.length) newIdx = 0;
    
    setSelectedItem(filteredItems[newIdx]);
  };

  // Grid View Component
  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredItems.map((item, index) => (
        <PortfolioCard
          key={item.id}
          item={item}
          index={index}
          isLiked={likedItems.includes(item.id)}
          onLike={() => toggleLike(item.id)}
          onShare={() => shareItem(item)}
          onClick={() => setSelectedItem(item)}
        />
      ))}
    </div>
  );
  
  // Masonry View Component
  const MasonryView = () => {
    const columns = 3;
    const columnItems = Array.from({ length: columns }, () => []);
    
    filteredItems.forEach((item, index) => {
      columnItems[index % columns].push(item);
    });
    
    return (
      <div className="flex gap-6">
        {columnItems.map((column, columnIndex) => (
          <div key={columnIndex} className="flex-1 space-y-6">
            {column.map((item, index) => (
              <PortfolioCard
                key={item.id}
                item={item}
                index={columnIndex * filteredItems.length / columns + index}
                isLiked={likedItems.includes(item.id)}
                onLike={() => toggleLike(item.id)}
                onShare={() => shareItem(item)}
                onClick={() => setSelectedItem(item)}
                masonry
              />
            ))}
          </div>
        ))}
      </div>
    );
  };
  
  // 3D Carousel View Component
  const CarouselView = () => {
    const itemWidth = 400;
    const spacing = 20;
    
    return (
      <div className="relative h-[600px] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            ref={carouselRef}
            className="flex"
            animate={{
              x: -(currentIndex * (itemWidth + spacing))
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ perspective: 1200 }}
          >
            {filteredItems.map((item, index) => {
              const offset = index - currentIndex;
              const isActive = index === currentIndex;
              
              return (
                <motion.div
                  key={item.id}
                  className="relative flex-shrink-0"
                  style={{
                    width: itemWidth,
                    marginRight: spacing,
                    transformStyle: 'preserve-3d'
                  }}
                  animate={{
                    rotateY: offset * -30,
                    scale: isActive ? 1 : 0.85,
                    opacity: Math.abs(offset) > 2 ? 0 : 1,
                    z: isActive ? 0 : -100
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <div
                    className="w-full h-full cursor-pointer"
                    onClick={() => {
                      if (isActive) {
                        setSelectedItem(item);
                      } else {
                        setCurrentIndex(index);
                      }
                    }}
                  >
                    <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                        <p className="text-gray-200">{item.category}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
        
        {/* Carousel Controls */}
        <button
          onClick={() => setCurrentIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % filteredItems.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
        
        {/* Auto-play Toggle */}
        <button
          onClick={() => setIsAutoPlay(!isAutoPlay)}
          className="absolute bottom-4 right-4 p-3 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          {isAutoPlay ? (
            <PauseIcon className="w-5 h-5" />
          ) : (
            <PlayIcon className="w-5 h-5" />
          )}
        </button>
        
        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {filteredItems.slice(0, 10).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-primary w-8'
                  : 'bg-gray-400 hover:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="البحث في المعرض..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">جميع الفئات</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          {/* View Mode Toggles */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-600 shadow'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title="عرض الشبكة"
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('masonry')}
              className={`p-2 rounded ${
                viewMode === 'masonry'
                  ? 'bg-white dark:bg-gray-600 shadow'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title="عرض البناء"
            >
              <ViewColumnsIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('carousel')}
              className={`p-2 rounded ${
                viewMode === 'carousel'
                  ? 'bg-white dark:bg-gray-600 shadow'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title="عرض ثلاثي الأبعاد"
            >
              <RectangleGroupIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Results Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        عرض {filteredItems.length} من أصل {items.length} عمل
      </div>
      
      {/* Gallery View */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' && <GridView key="grid" />}
        {viewMode === 'masonry' && <MasonryView key="masonry" />}
        {viewMode === 'carousel' && <CarouselView key="carousel" />}
      </AnimatePresence>
      
      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <Lightbox
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onNavigate={navigateItem}
            isLiked={likedItems.includes(selectedItem.id)}
            onLike={() => toggleLike(selectedItem.id)}
            onShare={() => shareItem(selectedItem)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Portfolio Card Component
const PortfolioCard = ({ item, index, isLiked, onLike, onShare, onClick, masonry = false }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  
  const controls = useAnimation();
  
  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [inView, controls]);
  
  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1
      }
    }
  };
  
  const heightClasses = masonry && Math.random() > 0.5 ? 'h-96' : 'h-64';
  
  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={controls}
      whileHover={{ y: -5 }}
      className="relative group cursor-pointer"
      onClick={onClick}
    >
      <div className={`relative ${masonry ? heightClasses : 'aspect-w-16 aspect-h-9'} rounded-xl overflow-hidden shadow-lg`}>
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="text-xl font-bold mb-1">{item.title}</h3>
            <p className="text-sm text-gray-200">{item.category}</p>
          </div>
          
          {/* Quick Actions */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike();
              }}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
            >
              {isLiked ? (
                <HeartSolidIcon className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5 text-white" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
            >
              <ShareIcon className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        
        {/* View count */}
        <div className="absolute top-4 left-4 flex items-center space-x-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
          <EyeIcon className="w-4 h-4 text-white" />
          <span className="text-xs text-white">{item.views || 0}</span>
        </div>
      </div>
    </motion.div>
  );
};

// Lightbox Component
const Lightbox = ({ item, onClose, onNavigate, isLiked, onLike, onShare }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className="relative max-w-6xl w-full max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent z-10">
          <div className="flex items-center justify-between text-white">
            <h2 className="text-2xl font-bold">{item.title}</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={onLike}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                {isLiked ? (
                  <HeartSolidIcon className="w-6 h-6 text-red-500" />
                ) : (
                  <HeartIcon className="w-6 h-6" />
                )}
              </button>
              <button
                onClick={onShare}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <ShareIcon className="w-6 h-6" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Image */}
        <div className="relative h-[70vh]">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-contain bg-gray-100 dark:bg-gray-800"
          />
        </div>
        
        {/* Info */}
        <div className="p-6 bg-white dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{item.category}</p>
              <p className="text-gray-700 dark:text-gray-300">{item.description}</p>
            </div>
            <div className="flex items-center space-x-2 text-gray-500">
              <EyeIcon className="w-5 h-5" />
              <span>{item.views || 0}</span>
            </div>
          </div>
        </div>
        
        {/* Navigation Arrows */}
        <button
          onClick={() => onNavigate(-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
        >
          <ChevronLeftIcon className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={() => onNavigate(1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
        >
          <ChevronRightIcon className="w-6 h-6 text-white" />
        </button>
      </motion.div>
    </motion.div>
  );
};

export default InteractivePortfolioGallery;