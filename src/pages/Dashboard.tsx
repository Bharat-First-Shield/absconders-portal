import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Users, FileText, Search, BarChart3, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getRecentActivities, getDistrictOverview, getCaseStatistics } from '../services/mongodb';
import toast from 'react-hot-toast';
import { StatusBadge } from '../components/StatusBadge';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { user } = useAuth();
  const username = user?.username || user?.name || 'User';

  const { data: stats, isLoading, error: statsError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
    retry: 1
  });

  const { data: caseStats, isLoading: isLoadingCaseStats, error: caseStatsError } = useQuery({
    queryKey: ['caseStatistics'],
    queryFn: getCaseStatistics,
    retry: 1
  });

  const { data: recentActivities, isLoading: isLoadingActivities, error: activitiesError } = useQuery({
    queryKey: ['recentActivities'],
    queryFn: getRecentActivities,
    retry: 1
  });

  const { data: districtOverview, isLoading: isLoadingDistricts, error: districtsError } = useQuery({
    queryKey: ['districtOverview'],
    queryFn: getDistrictOverview,
    retry: 1
  });

  useEffect(() => {
    if (statsError) {
      toast.error('Failed to load dashboard statistics');
    }
    if (activitiesError) {
      toast.error('Failed to load recent activities');
    }
    if (districtsError) {
      toast.error('Failed to load district overview');
    }
    if (caseStatsError) {
      toast.error('Failed to load case statistics');
    }
  }, [statsError, activitiesError, districtsError, caseStatsError]);

  const statCards = [
    { 
      label: 'Total Cases', 
      value: stats?.totalCases ?? '...', 
      icon: FileText, 
      color: 'bg-blue-500',
      link: '/cases'
    },
    { 
      label: 'Active Cases', 
      value: stats?.activeCases ?? '...', 
      icon: AlertTriangle, 
      color: 'bg-red-500',
      link: '/cases?status=active'
    },
    { 
      label: 'Arrested', 
      value: stats?.arrestedCases ?? '...', 
      icon: CheckCircle, 
      color: 'bg-green-500',
      link: '/cases?status=arrested'
    },
    { 
      label: 'Closed Cases', 
      value: stats?.closedCases ?? '...', 
      icon: XCircle, 
      color: 'bg-gray-500',
      link: '/cases?status=closed'
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-2xl font-bold"
        >
          Welcome, {username}
        </motion.h1>
        <motion.span 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
        >
          {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
        </motion.span>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            variants={item}
            whileHover={{ scale: 1.03, y: -5 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg"
          >
            <Link to={stat.link} className="flex items-center group">
              <div className={`p-3 rounded-full ${stat.color} transform transition-transform duration-300 group-hover:scale-110`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {stat.label}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {isLoading ? (
                    <span className="inline-block w-12 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></span>
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Case Status Distribution */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
      >
        <h2 className="text-lg font-semibold mb-4">Case Status Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div 
            whileHover={{ y: -5 }}
            className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all duration-300 hover:shadow-md"
          >
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-3">
              <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400" />
            </div>
            <StatusBadge status="active" size="lg" />
            <p className="text-2xl font-bold mt-2">
              {isLoadingCaseStats ? (
                <span className="inline-block w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></span>
              ) : (
                caseStats?.activeCases || '...'
              )}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Active Cases</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all duration-300 hover:shadow-md"
          >
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-3">
              <CheckCircle className="w-8 h-8 text-green-500 dark:text-green-400" />
            </div>
            <StatusBadge status="arrested" size="lg" />
            <p className="text-2xl font-bold mt-2">
              {isLoadingCaseStats ? (
                <span className="inline-block w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></span>
              ) : (
                caseStats?.arrestedCases || '...'
              )}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Arrested</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all duration-300 hover:shadow-md"
          >
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center mb-3">
              <XCircle className="w-8 h-8 text-gray-500 dark:text-gray-400" />
            </div>
            <StatusBadge status="closed" size="lg" />
            <p className="text-2xl font-bold mt-2">
              {isLoadingCaseStats ? (
                <span className="inline-block w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></span>
              ) : (
                caseStats?.closedCases || '...'
              )}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Closed Cases</p>
          </motion.div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
        >
          <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {isLoadingActivities ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-500 mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : activitiesError ? (
              <div className="text-center py-6 text-red-500">
                Error loading activities. Please try again.
              </div>
            ) : recentActivities && recentActivities.length > 0 ? (
              recentActivities.map((activity: any, i: number) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ x: 5 }}
                  className={`flex items-center p-3 rounded-lg ${
                    activity.actionType === 'status_change'
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : activity.actionType === 'create'
                      ? 'bg-green-50 dark:bg-green-900/20'
                      : 'bg-gray-50 dark:bg-gray-700'
                  } transition-all duration-200`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    activity.actionType === 'status_change'
                      ? 'bg-blue-500'
                      : activity.actionType === 'create'
                      ? 'bg-green-500'
                      : 'bg-gray-400'
                  } mr-3`} />
                  <div>
                    <p className="text-sm font-medium">{activity.description}</p>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>{new Date(activity.timestamp).toLocaleString()}</span>
                      <span className="mx-1">•</span>
                      <span>{activity.userName}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                No recent activities found.
              </div>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
        >
          <h2 className="text-lg font-semibold mb-4">District Overview</h2>
          <div className="space-y-4">
            {isLoadingDistricts ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center justify-between animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
                  <div className="w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
                </div>
              ))
            ) : districtsError ? (
              <div className="text-center py-6 text-red-500">
                Error loading district data. Please try again.
              </div>
            ) : districtOverview && districtOverview.length > 0 ? (
              districtOverview.map((district, index) => (
                <motion.div 
                  key={district._id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between group"
                >
                  <span className="text-sm font-medium">{district._id}</span>
                  <div className="w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${Math.min(100, (district.caseCount / Math.max(...districtOverview.map(d => d.caseCount))) * 100)}%` 
                      }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      className="bg-primary-600 h-2.5 rounded-full"
                    ></motion.div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {district.caseCount} cases
                  </span>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                No district data available.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}