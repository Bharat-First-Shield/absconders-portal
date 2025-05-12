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
        return 'px-2 py-0.5 text-xs';
      case 'lg':
        return 'px-3 py-1.5 text-sm';
      case 'md':
      default:
        return 'px-2.5 py-1 text-xs';
    }
  };

  return (
    <motion.span 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={`rounded-full font-medium border ${getStatusStyles()} ${getSizeStyles()} inline-flex items-center justify-center whitespace-nowrap max-w-full overflow-hidden text-ellipsis`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1 flex-shrink-0 ${
        status === 'active' ? 'bg-red-500 dark:bg-red-400' : 
        status === 'arrested' ? 'bg-green-500 dark:bg-green-400' : 
        'bg-gray-500 dark:bg-gray-400'
      }`}></span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </motion.span>
  );
}