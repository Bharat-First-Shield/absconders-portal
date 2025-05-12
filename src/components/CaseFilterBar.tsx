import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaseFilter, CaseStatus } from '../types';
import { Filter, X, Search, Calendar, MapPin } from 'lucide-react';

interface CaseFilterBarProps {
  onFilterChange: (filters: CaseFilter) => void;
  initialFilters?: CaseFilter;
}

export function CaseFilterBar({ onFilterChange, initialFilters = {} }: CaseFilterBarProps) {
  const [filters, setFilters] = useState<CaseFilter>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof CaseFilter, value: any) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    const emptyFilters: CaseFilter = {};
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const statusOptions: { value: CaseStatus | ''; label: string }[] = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'arrested', label: 'Arrested' },
    { value: 'closed', label: 'Closed' }
  ];

  const sortOptions: { value: string; label: string }[] = [
    { value: 'date_desc', label: 'Newest First' },
    { value: 'date_asc', label: 'Oldest First' },
    { value: 'name_asc', label: 'Name (A-Z)' },
    { value: 'name_desc', label: 'Name (Z-A)' },
    { value: 'status_asc', label: 'Status (A-Z)' },
    { value: 'status_desc', label: 'Status (Z-A)' }
  ];

  const handleSortChange = (sortString: string) => {
    const [sortBy, sortOrder] = sortString.split('_');
    handleFilterChange('sortBy', sortBy as any);
    handleFilterChange('sortOrder', sortOrder as any);
  };

  const getSortValue = () => {
    if (!filters.sortBy) return 'date_desc';
    return `${filters.sortBy}_${filters.sortOrder || 'asc'}`;
  };

  const filterCount = Object.keys(filters).filter(key => 
    filters[key as keyof CaseFilter] !== undefined && 
    filters[key as keyof CaseFilter] !== '' && 
    key !== 'sortBy' && 
    key !== 'sortOrder'
  ).length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Filters</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 relative"
            aria-label="Toggle filters"
          >
            <Filter className="w-4 h-4" />
            {filterCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {filterCount}
              </span>
            )}
          </motion.button>
          {Object.keys(filters).length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearFilters}
              className="p-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition-colors duration-200"
              aria-label="Clear filters"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
              value={filters.query || ''}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              aria-label="Search query"
            />
          </div>

          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value as CaseStatus)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
            aria-label="Filter by status"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={getSortValue()}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
            aria-label="Sort results"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 pt-4 border-t dark:border-gray-700"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <MapPin className="w-4 h-4" />
                  District
                </label>
                <input
                  type="text"
                  placeholder="Enter district"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
                  value={filters.district || ''}
                  onChange={(e) => handleFilterChange('district', e.target.value)}
                  aria-label="Filter by district"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <MapPin className="w-4 h-4" />
                  State
                </label>
                <input
                  type="text"
                  placeholder="Enter state"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
                  value={filters.state || ''}
                  onChange={(e) => handleFilterChange('state', e.target.value)}
                  aria-label="Filter by state"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Calendar className="w-4 h-4" />
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
                    value={filters.dateFrom || ''}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    aria-label="From date"
                  />
                  <input
                    type="date"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
                    value={filters.dateTo || ''}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    aria-label="To date"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded text-primary-600 focus:ring-primary-500"
                  checked={filters.hasWarrant || false}
                  onChange={(e) => handleFilterChange('hasWarrant', e.target.checked)}
                  aria-label="Only show cases with active warrants"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Only show cases with active warrants
                </span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}