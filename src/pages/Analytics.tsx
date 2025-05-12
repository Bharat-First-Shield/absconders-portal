import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { getAnalytics, getDistrictAnalytics } from '../services/mongodb';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export function Analytics() {
  const [timeRange, setTimeRange] = React.useState<'daily' | 'weekly' | 'monthly'>('daily');

  const { data: timeSeriesData, isLoading: isLoadingTimeSeries, error: timeSeriesError } = useQuery({
    queryKey: ['analytics', timeRange],
    queryFn: () => getAnalytics(timeRange),
    retry: 1
  });

  const { data: districtData, isLoading: isLoadingDistrict, error: districtError } = useQuery({
    queryKey: ['districtAnalytics'],
    queryFn: getDistrictAnalytics,
    retry: 1
  });

  useEffect(() => {
    if (timeSeriesError) {
      toast.error('Failed to load time series data');
    }
    if (districtError) {
      toast.error('Failed to load district data');
    }
  }, [timeSeriesError, districtError]);

  const timeSeriesChartData = {
    labels: timeSeriesData?.map(d => d._id) || [],
    datasets: [
      {
        label: 'New Cases',
        data: timeSeriesData?.map(d => d.newCases) || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Active Warrants',
        data: timeSeriesData?.map(d => d.activeWarrants) || [],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  };

  const districtChartData = {
    labels: districtData?.map(d => d._id) || [],
    datasets: [
      {
        label: 'Total Cases',
        data: districtData?.map(d => d.totalCases) || [],
        backgroundColor: 'rgba(75, 192, 192, 0.5)'
      },
      {
        label: 'Active Warrants',
        data: districtData?.map(d => d.activeWarrants) || [],
        backgroundColor: 'rgba(255, 99, 132, 0.5)'
      }
    ]
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'daily' | 'weekly' | 'monthly')}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-colors"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Case Trends</h2>
          {isLoadingTimeSeries ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : timeSeriesError ? (
            <div className="flex items-center justify-center h-64 text-red-500">
              Error loading data. Please try again.
            </div>
          ) : (
            <Line
              data={timeSeriesChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: true,
                    text: 'Case and Warrant Trends'
                  }
                }
              }}
            />
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">District-wise Distribution</h2>
          {isLoadingDistrict ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : districtError ? (
            <div className="flex items-center justify-center h-64 text-red-500">
              Error loading data. Please try again.
            </div>
          ) : (
            <Bar
              data={districtChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: true,
                    text: 'Cases by District'
                  }
                }
              }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}