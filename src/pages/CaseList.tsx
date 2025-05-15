import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { searchCriminals } from '../services/mongodb';
import { Eye, Edit, AlertTriangle, Filter, Plus, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { CaseFilterBar } from '../components/CaseFilterBar';
import { KeyboardShortcutsHelp } from '../components/KeyboardShortcutsHelp';
import { CaseFilter } from '../types';

export function CaseList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { canEditCase } = useAuth();
  const [filters, setFilters] = useState<CaseFilter>({});

  // Parse URL query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlFilters: CaseFilter = {};
    
    if (searchParams.has('status')) {
      urlFilters.status = searchParams.get('status') as any;
    }
    
    if (Object.keys(urlFilters).length > 0) {
      setFilters(urlFilters);
    }
  }, [location.search]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['criminals', filters],
    queryFn: () => searchCriminals(filters),
    enabled: true
  });

  // Ensure data is an array
  const criminals = Array.isArray(data) ? data : [];

  useEffect(() => {
    if (error) {
      toast.error('Failed to load criminal records');
    }
  }, [error]);

  const handleFilterChange = (newFilters: CaseFilter) => {
    setFilters(newFilters);
    
    // Update URL with filters
    const searchParams = new URLSearchParams();
    if (newFilters.status) searchParams.set('status', newFilters.status);
    
    const newSearch = searchParams.toString();
    if (newSearch) {
      navigate(`${location.pathname}?${newSearch}`);
    } else {
      navigate(location.pathname);
    }
  };

  // Keyboard shortcuts
  const shortcuts = [
    {
      key: 'n',
      description: 'Add new case',
      action: () => canEditCase() && navigate('/cases/new')
    },
    {
      key: 'f',
      description: 'Focus on search',
      action: () => document.querySelector('input[type="text"]')?.focus()
    },
    {
      key: 'Escape',
      description: 'Clear filters',
      action: () => handleFilterChange({})
    },
    {
      key: 'a',
      description: 'Go to analytics',
      action: () => navigate('/analytics')
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="text-2xl font-bold">Criminal Records</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/analytics')}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 flex items-center gap-2 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Analytics</span>
          </motion.button>
          
          {canEditCase() && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/cases/new')}
              className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Case</span>
            </motion.button>
          )}
        </div>
      </div>

      <CaseFilterBar 
        onFilterChange={handleFilterChange}
        initialFilters={filters}
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            Error loading data. Please try again.
          </div>
        ) : criminals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b dark:border-gray-700">
                  <th className="pb-3 px-4">FIR Number</th>
                  <th className="pb-3 px-4">Name</th>
                  <th className="pb-3 px-4">Age</th>
                  <th className="pb-3 px-4">District</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {criminals.map((criminal) => (
                  <motion.tr
                    key={criminal._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="py-3 px-4">{criminal.firNumber}</td>
                    <td className="py-3 px-4">{criminal.name}</td>
                    <td className="py-3 px-4">{criminal.age}</td>
                    <td className="py-3 px-4">{criminal.district}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={criminal.status} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => navigate(`/cases/${criminal._id}`)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        {canEditCase() && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(`/cases/${criminal._id}/edit`)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                            title="Edit Case"
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                        )}
                        {criminal.warrants.some(w => w.isActive) && (
                          <AlertTriangle className="w-4 h-4 text-red-500" title="Active Warrant" />
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No records found matching your criteria.
          </div>
        )}
      </div>

      <KeyboardShortcutsHelp shortcuts={shortcuts} />
    </motion.div>
  );
}