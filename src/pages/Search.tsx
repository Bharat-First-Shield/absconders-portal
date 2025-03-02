import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Filter, MapPin, Calendar, User } from 'lucide-react';
import { searchCriminals } from '../services/mongodb';
import toast from 'react-hot-toast';

export function Search() {
  const [filters, setFilters] = React.useState({
    query: '',
    state: '',
    district: '',
    dateFrom: '',
    dateTo: '',
    status: '',
    gender: '',
    ageFrom: '',
    ageTo: '',
    hasWarrant: false
  });

  const { data: results, isLoading, error } = useQuery({
    queryKey: ['criminals', filters],
    queryFn: () => searchCriminals(filters.query),
    enabled: filters.query.length > 2
  });

  useEffect(() => {
    if (error) {
      toast.error('Failed to search criminal records');
    }
  }, [error]);

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Search Records</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setFilters({
            query: '',
            state: '',
            district: '',
            dateFrom: '',
            dateTo: '',
            status: '',
            gender: '',
            ageFrom: '',
            ageTo: '',
            hasWarrant: false
          })}
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm transition-colors"
        >
          Clear Filters
        </motion.button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={filters.query}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              placeholder="Search by name, FIR number, or ID..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filters.state}
              onChange={(e) => handleFilterChange('state', e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
            >
              <option value="">Select State</option>
              <option value="maharashtra">Maharashtra</option>
              <option value="gujarat">Gujarat</option>
              <option value="rajasthan">Rajasthan</option>
            </select>
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filters.district}
              onChange={(e) => handleFilterChange('district', e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
            >
              <option value="">Select District</option>
              <option value="mumbai">Mumbai</option>
              <option value="pune">Pune</option>
              <option value="nagpur">Nagpur</option>
            </select>
          </div>

          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
            >
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="arrested">Arrested</option>
              <option value="deceased">Deceased</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.hasWarrant}
              onChange={(e) => handleFilterChange('hasWarrant', e.target.checked)}
              className="rounded text-primary-600 focus:ring-primary-500"
            />
            <label className="text-sm">Active Warrant Only</label>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            Error loading data. Please try again.
          </div>
        ) : results && results.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b dark:border-gray-700">
                  <th className="pb-3 px-4">Photo</th>
                  <th className="pb-3 px-4">FIR Number</th>
                  <th className="pb-3 px-4">Name</th>
                  <th className="pb-3 px-4">Age</th>
                  <th className="pb-3 px-4">District</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((criminal) => (
                  <motion.tr
                    key={criminal._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <img
                        src={criminal.images?.[0]?.url || 'https://via.placeholder.com/40'}
                        alt={criminal.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </td>
                    <td className="py-3 px-4">{criminal.firNumber}</td>
                    <td className="py-3 px-4">{criminal.name}</td>
                    <td className="py-3 px-4">{criminal.age}</td>
                    <td className="py-3 px-4">{criminal.district}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        criminal.status === 'active'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : criminal.status === 'arrested'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {criminal.status.charAt(0).toUpperCase() + criminal.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        View Details
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : filters.query.length > 2 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No records found matching your search criteria.
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Enter at least 3 characters to search.
          </div>
        )}
      </div>
    </motion.div>
  );
}