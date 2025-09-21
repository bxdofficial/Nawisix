import React from 'react';
import { motion } from 'framer-motion';

// Base Skeleton Component
const Skeleton = ({ className = '', animate = true }) => {
  return (
    <div
      className={`
        bg-gray-200 dark:bg-gray-700
        ${animate ? 'animate-pulse' : ''}
        ${className}
      `}
    />
  );
};

// Text Skeleton
export const SkeletonText = ({ lines = 3, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={`h-4 rounded ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
};

// Card Skeleton
export const SkeletonCard = ({ showImage = true, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg ${className}`}>
      {showImage && (
        <Skeleton className="h-48 w-full" />
      )}
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4 rounded" />
        <SkeletonText lines={2} />
        <div className="flex items-center space-x-2 pt-2">
          <Skeleton className="h-8 w-20 rounded" />
          <Skeleton className="h-8 w-20 rounded" />
        </div>
      </div>
    </div>
  );
};

// Portfolio Item Skeleton
export const SkeletonPortfolio = ({ className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`relative group ${className}`}
    >
      <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
        <div className="absolute bottom-4 left-4 right-4">
          <Skeleton className="h-6 w-3/4 rounded mb-2" />
          <Skeleton className="h-4 w-1/2 rounded" />
        </div>
      </div>
    </motion.div>
  );
};

// Service Card Skeleton
export const SkeletonService = ({ className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg ${className}`}>
      <div className="flex items-center mb-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <Skeleton className="ml-3 h-6 w-32 rounded" />
      </div>
      <SkeletonText lines={3} />
      <Skeleton className="mt-4 h-10 w-full rounded-lg" />
    </div>
  );
};

// Testimonial Skeleton
export const SkeletonTestimonial = ({ className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg ${className}`}>
      <div className="flex items-center mb-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="ml-4 flex-1">
          <Skeleton className="h-5 w-32 rounded mb-2" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
      </div>
      <SkeletonText lines={4} />
      <div className="flex mt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="w-5 h-5 rounded mr-1" />
        ))}
      </div>
    </div>
  );
};

// Blog Post Skeleton
export const SkeletonBlogPost = ({ className = '' }) => {
  return (
    <article className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg ${className}`}>
      <Skeleton className="h-64 w-full" />
      <div className="p-6">
        <div className="flex items-center mb-4">
          <Skeleton className="h-4 w-20 rounded mr-4" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
        <Skeleton className="h-8 w-3/4 rounded mb-3" />
        <SkeletonText lines={3} />
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="ml-3 h-4 w-24 rounded" />
          </div>
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </article>
  );
};

// Table Skeleton
export const SkeletonTable = ({ rows = 5, columns = 4, className = '' }) => {
  return (
    <div className={`overflow-hidden ${className}`}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="px-6 py-3">
                <Skeleton className="h-4 rounded" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <Skeleton className="h-4 rounded" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Dashboard Stats Skeleton
export const SkeletonStats = ({ className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>
          <Skeleton className="h-8 w-32 rounded mb-2" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
      ))}
    </div>
  );
};

// Gallery Grid Skeleton
export const SkeletonGallery = ({ items = 6, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <SkeletonPortfolio key={index} />
      ))}
    </div>
  );
};

// Form Skeleton
export const SkeletonForm = ({ fields = 4, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index}>
          <Skeleton className="h-4 w-24 rounded mb-2" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <div className="flex space-x-4 pt-4">
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  );
};

// Profile Skeleton
export const SkeletonProfile = ({ className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg ${className}`}>
      <div className="flex items-center space-x-4 mb-6">
        <Skeleton className="w-24 h-24 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-6 w-40 rounded mb-2" />
          <Skeleton className="h-4 w-32 rounded mb-2" />
          <Skeleton className="h-4 w-48 rounded" />
        </div>
      </div>
      <SkeletonText lines={4} />
      <div className="mt-6 flex space-x-3">
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  );
};

// Chat Message Skeleton
export const SkeletonMessage = ({ isUser = false, className = '' }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 ${className}`}>
      <div className={`flex items-end space-x-2 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
        <div className="max-w-xs">
          <Skeleton className={`h-20 rounded-lg ${isUser ? 'rounded-br-none' : 'rounded-bl-none'}`} />
          <Skeleton className="h-3 w-16 rounded mt-1" />
        </div>
      </div>
    </div>
  );
};

// Timeline Skeleton
export const SkeletonTimeline = ({ items = 4, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className={`relative flex items-center mb-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
          <div className="flex-1">
            <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg ${index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'}`}>
              <Skeleton className="h-5 w-32 rounded mb-2" />
              <SkeletonText lines={2} />
            </div>
          </div>
          <Skeleton className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full -translate-x-1/2" />
        </div>
      ))}
    </div>
  );
};

export default Skeleton;