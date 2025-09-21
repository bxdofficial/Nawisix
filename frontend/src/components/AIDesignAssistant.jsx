import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon, 
  LightBulbIcon, 
  PaintBrushIcon,
  SwatchIcon,
  CubeIcon,
  ChatBubbleBottomCenterTextIcon,
  XMarkIcon,
  ChevronRightIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/EnhancedThemeContext';
import axios from 'axios';

const AIDesignAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('suggestions');
  const [suggestions, setSuggestions] = useState([]);
  const [colorPalette, setColorPalette] = useState([]);
  const [loadingsuggestions, setLoadingSuggestions] = useState(false);
  const [userBrand, setUserBrand] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const { isDark, colorPreset } = useTheme();
  const fileInputRef = useRef(null);

  // Design suggestions database
  const designTips = {
    layout: [
      'استخدم قاعدة الأثلاث لتوزيع العناصر بشكل متوازن',
      'اترك مساحات بيضاء كافية لتحسين القراءة',
      'استخدم الشبكة (Grid) لتنظيم المحتوى',
      'اجعل التسلسل الهرمي واضحاً بأحجام مختلفة',
      'استخدم التباين لجذب الانتباه للعناصر المهمة',
    ],
    colors: [
      'استخدم الألوان التكميلية للتباين القوي',
      'حدد لوناً أساسياً ولونين ثانويين فقط',
      'استخدم درجات اللون الواحد للتناسق',
      'تأكد من التباين الكافي للنصوص',
      'استخدم الألوان الدافئة للإثارة والباردة للهدوء',
    ],
    typography: [
      'لا تستخدم أكثر من 3 خطوط مختلفة',
      'اجعل حجم النص 16px كحد أدنى للقراءة',
      'استخدم line-height بنسبة 1.5 للنصوص',
      'استخدم الخط العريض للعناوين فقط',
      'اختر خطوطاً تدعم اللغة العربية بشكل جيد',
    ],
    ux: [
      'اجعل الأزرار كبيرة بما يكفي للمس (44px)',
      'أضف تأكيداً مرئياً للإجراءات',
      'استخدم الأيقونات مع النصوص للوضوح',
      'قلل عدد النقرات المطلوبة للوصول',
      'أضف رسائل خطأ واضحة ومفيدة',
    ],
  };

  // Generate random suggestion based on context
  const generateSuggestion = () => {
    const categories = Object.keys(designTips);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const tips = designTips[randomCategory];
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    
    return {
      category: randomCategory,
      tip: randomTip,
      icon: getCategoryIcon(randomCategory),
      timestamp: new Date().toISOString(),
    };
  };

  // Get icon for category
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'layout':
        return CubeIcon;
      case 'colors':
        return SwatchIcon;
      case 'typography':
        return ChatBubbleBottomCenterTextIcon;
      case 'ux':
        return LightBulbIcon;
      default:
        return SparklesIcon;
    }
  };

  // Generate color palette based on brand
  const generateColorPalette = async () => {
    setLoadingSuggestions(true);
    
    // Simulate AI color generation
    setTimeout(() => {
      const baseColors = {
        modern: ['#0EA5E9', '#8B5CF6', '#F97316', '#10B981', '#F59E0B'],
        elegant: ['#1E293B', '#E11D48', '#7C3AED', '#059669', '#B91C1C'],
        playful: ['#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'],
        professional: ['#1E40AF', '#059669', '#DC2626', '#7C2D12', '#4B5563'],
        minimalist: ['#000000', '#FFFFFF', '#6B7280', '#EF4444', '#3B82F6'],
      };
      
      const style = userBrand.toLowerCase();
      const palette = baseColors[style] || baseColors.modern;
      
      setColorPalette(palette.map((color, index) => ({
        hex: color,
        name: `Color ${index + 1}`,
        usage: index === 0 ? 'Primary' : index === 1 ? 'Secondary' : 'Accent',
      })));
      
      setLoadingSuggestions(false);
    }, 1500);
  };

  // Analyze uploaded image
  const analyzeImage = (file) => {
    setLoadingSuggestions(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      // Simulate AI image analysis
      setTimeout(() => {
        setAnalysisResult({
          mainColors: ['#0EA5E9', '#F97316', '#8B5CF6', '#10B981'],
          style: 'Modern & Clean',
          suggestions: [
            'الصورة تستخدم ألواناً زاهية - جرب استخدامها في العناصر التفاعلية',
            'التكوين متوازن - طبق نفس المبدأ في تصميمك',
            'يوجد تباين جيد - احتفظ بنفس مستوى التباين',
          ],
          contrast: 'Good (AA)',
          mood: 'Professional & Energetic',
        });
        setLoadingSuggestions(false);
      }, 2000);
    };
    reader.readAsDataURL(file);
  };

  // Auto-generate suggestion every 30 seconds
  useEffect(() => {
    if (isOpen && !isMinimized) {
      const interval = setInterval(() => {
        const newSuggestion = generateSuggestion();
        setSuggestions(prev => [newSuggestion, ...prev].slice(0, 5));
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isOpen, isMinimized]);

  // Initialize with a suggestion
  useEffect(() => {
    setSuggestions([generateSuggestion()]);
  }, []);

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-primary to-secondary text-white rounded-full shadow-lg flex items-center justify-center group"
          >
            <SparklesIcon className="w-7 h-7" />
            <div className="absolute -top-12 right-0 bg-gray-900 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              AI مساعد التصميم
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className={`fixed right-4 ${isMinimized ? 'bottom-4' : 'top-20 bottom-4'} w-96 z-50 flex flex-col`}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-secondary p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <SparklesIcon className="w-6 h-6" />
                    <h3 className="font-bold text-lg">AI مساعد التصميم</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsMinimized(!isMinimized)}
                      className="p-1 hover:bg-white/20 rounded transition-colors"
                    >
                      <ChevronRightIcon className={`w-5 h-5 transform transition-transform ${isMinimized ? 'rotate-90' : '-rotate-90'}`} />
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1 hover:bg-white/20 rounded transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              {!isMinimized && (
                <div className="flex-1 overflow-hidden flex flex-col">
                  {/* Tabs */}
                  <div className="flex border-b border-gray-200 dark:border-gray-700">
                    {['suggestions', 'colors', 'analyze'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                          activeTab === tab
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                      >
                        {tab === 'suggestions' ? 'نصائح' : tab === 'colors' ? 'الألوان' : 'تحليل'}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <AnimatePresence mode="wait">
                      {/* Suggestions Tab */}
                      {activeTab === 'suggestions' && (
                        <motion.div
                          key="suggestions"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-3"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                              نصائح التصميم
                            </h4>
                            <button
                              onClick={() => setSuggestions([generateSuggestion(), ...suggestions].slice(0, 5))}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            >
                              <ArrowPathIcon className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {suggestions.map((suggestion, index) => {
                            const Icon = suggestion.icon;
                            return (
                              <motion.div
                                key={`${suggestion.timestamp}-${index}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="flex-shrink-0">
                                    <Icon className="w-5 h-5 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                      {suggestion.tip}
                                    </p>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      {suggestion.category}
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      )}

                      {/* Colors Tab */}
                      {activeTab === 'colors' && (
                        <motion.div
                          key="colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-4"
                        >
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              نوع العلامة التجارية
                            </label>
                            <input
                              type="text"
                              value={userBrand}
                              onChange={(e) => setUserBrand(e.target.value)}
                              placeholder="مثال: modern, elegant, playful"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                            <button
                              onClick={generateColorPalette}
                              disabled={loadingsuggestions || !userBrand}
                              className="mt-2 w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {loadingsuggestions ? 'جاري التوليد...' : 'توليد لوحة ألوان'}
                            </button>
                          </div>

                          {colorPalette.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                                لوحة الألوان المقترحة
                              </h4>
                              {colorPalette.map((color, index) => (
                                <div
                                  key={index}
                                  className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                >
                                  <div
                                    className="w-12 h-12 rounded-lg shadow-inner"
                                    style={{ backgroundColor: color.hex }}
                                  />
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{color.hex}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {color.usage}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => navigator.clipboard.writeText(color.hex)}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* Analyze Tab */}
                      {activeTab === 'analyze' && (
                        <motion.div
                          key="analyze"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-4"
                        >
                          <div>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files[0] && analyzeImage(e.target.files[0])}
                              className="hidden"
                            />
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full px-4 py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <PaintBrushIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                اسحب صورة هنا أو انقر للاختيار
                              </p>
                            </button>
                          </div>

                          {loadingsuggestions && (
                            <div className="text-center py-4">
                              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                جاري تحليل الصورة...
                              </p>
                            </div>
                          )}

                          {analysisResult && !loadingsuggestions && (
                            <div className="space-y-3">
                              <div>
                                <h5 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                                  الألوان الرئيسية
                                </h5>
                                <div className="flex space-x-2">
                                  {analysisResult.mainColors.map((color, index) => (
                                    <div
                                      key={index}
                                      className="w-10 h-10 rounded-lg shadow-inner"
                                      style={{ backgroundColor: color }}
                                      title={color}
                                    />
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h5 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-1">
                                  النمط: {analysisResult.style}
                                </h5>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  المزاج: {analysisResult.mood}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  التباين: {analysisResult.contrast}
                                </p>
                              </div>

                              <div>
                                <h5 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                                  التوصيات
                                </h5>
                                {analysisResult.suggestions.map((suggestion, index) => (
                                  <p key={index} className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    • {suggestion}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIDesignAssistant;