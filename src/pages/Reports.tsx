import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FileText, Download, Filter, Calendar } from 'lucide-react';
import { getDashboardStats, getDistrictAnalytics } from '../services/mongodb';
import html2pdf from 'html2pdf.js';
import toast from 'react-hot-toast';

export function Reports() {
  const { data: stats, error: statsError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats
  });

  const { data: districtData, error: districtError } = useQuery({
    queryKey: ['districtAnalytics'],
    queryFn: getDistrictAnalytics
  });

  useEffect(() => {
    if (statsError) {
      toast.error('Failed to load dashboard statistics');
    }
    if (districtError) {
      toast.error('Failed to load district analytics');
    }
  }, [statsError, districtError]);

  const [reportConfig, setReportConfig] = React.useState({
    dateRange: '7',
    includeStats: true,
    includeWarrants: true,
    includeDistricts: true,
    includeLogs: true,
    format: 'pdf'
  });

  const generateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stats || !districtData) {
      toast.error('Cannot generate report: data not available');
      return;
    }
    
    const reportData = {
      timestamp: new Date().toISOString(),
      overview: stats,
      districtBreakdown: districtData,
      config: reportConfig
    };

    const element = document.createElement('div');
    element.innerHTML = `
      <div style="padding: 20px;">
        <h1 style="font-size: 24px; margin-bottom: 20px;">Absconders Portal Report</h1>
        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 18px; margin-bottom: 10px;">Overview</h2>
          <p>Total Cases: ${stats?.totalCases || 0}</p>
          <p>Active Warrants: ${stats?.activeWarrants || 0}</p>
          <p>Recent Searches: ${stats?.searchCount || 0}</p>
        </div>
        <div>
          <h2 style="font-size: 18px; margin-bottom: 10px;">District Breakdown</h2>
          ${districtData?.map((d: any) => `
            <div style="margin-bottom: 10px;">
              <h3 style="font-size: 16px;">${d._id}</h3>
              <p>Total Cases: ${d.totalCases}</p>
              <p>Active Warrants: ${d.activeWarrants}</p>
            </div>
          `).join('') || ''}
        </div>
      </div>
    `;

    const opt = {
      margin: 1,
      filename: `absconders-report-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
      console.error('Report generation error:', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reports</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Overview Report</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary-500" />
                <span>Total Cases Overview</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={generateReport}
                className="text-primary-600 hover:text-primary-700 transition-colors"
                disabled={!stats || !districtData}
              >
                <Download className="w-5 h-5" />
              </motion.button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary-500" />
                <span>Active Warrants Report</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={generateReport}
                className="text-primary-600 hover:text-primary-700 transition-colors"
                disabled={!stats || !districtData}
              >
                <Download className="w-5 h-5" />
              </motion.button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary-500" />
                <span>District-wise Analysis</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={generateReport}
                className="text-primary-600 hover:text-primary-700 transition-colors"
                disabled={!stats || !districtData}
              >
                <Download className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Custom Report</h2>
          <form onSubmit={generateReport} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date Range</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={reportConfig.dateRange}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="180">Last 180 days</option>
                  <option value="365">Last 365 days</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Report Type</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={reportConfig.includeStats}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, includeStats: e.target.checked }))}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2">Case Statistics</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={reportConfig.includeWarrants}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, includeWarrants: e.target.checked }))}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2">Warrant Analysis</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={reportConfig.includeDistricts}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, includeDistricts: e.target.checked }))}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2">District Breakdown</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={reportConfig.includeLogs}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, includeLogs: e.target.checked }))}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2">Activity Logs</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Format</label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={reportConfig.format}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, format: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
                >
                  <option value="pdf">PDF</option>
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                </select>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors"
              disabled={!stats || !districtData}
            >
              Generate Custom Report
            </motion.button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}