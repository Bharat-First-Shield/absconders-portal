import React from 'react';
import { motion } from 'framer-motion';
import { CaseStatus } from '../types';

interface StatusBadgeProps {
  status: CaseStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800/50';
      case 'arrested':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800/50';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'w-2 h-2';
      case 'lg':
        return 'w-3 h-3';
      case 'md':
      default:
        return 'w-2.5 h-2.5';
    }
  };

  return (
    <motion.span 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={`rounded-full border ${getStatusStyles()} inline-flex items-center justify-center`}
    >
      <span className={`${getSizeStyles()} rounded-full flex-shrink-0 ${
        status === 'active' ? 'bg-red-500 dark:bg-red-400' : 
        status === 'arrested' ? 'bg-green-500 dark:bg-green-400' : 
        'bg-gray-500 dark:bg-gray-400'
      }`}></span>
    </motion.span>
  );
}