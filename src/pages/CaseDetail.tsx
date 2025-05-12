import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  getCriminalDetails, 
  updateCaseStatus, 
  getCaseStatusHistory,
  getCaseAuditLogs
} from '../services/mongodb';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Edit, 
  Clock, 
  FileText, 
  User, 
  MapPin, 
  Calendar, 
  AlertTriangle,
  Printer,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import { StatusBadge } from '../components/StatusBadge';
import { CaseStatusSelector } from '../components/CaseStatusSelector';
import { CaseHistoryTimeline } from '../components/CaseHistoryTimeline';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { KeyboardShortcutsHelp } from '../components/KeyboardShortcutsHelp';
import { CaseStatus } from '../types';

export function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, canChangeStatus } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'status' | 'edit' | 'view'>('all');
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);

  // Fetch case details
  const { 
    data: criminal, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['criminal', id],
    queryFn: () => getCriminalDetails(id || ''),
    enabled: !!id
  });

  // Fetch case history
  const {
    data: statusHistory,
    isLoading: isLoadingHistory
  } = useQuery({
    queryKey: ['statusHistory', id],
    queryFn: () => getCaseStatusHistory(id || ''),
    enabled: !!id && activeTab === 'history'
  });

  // Fetch audit logs
  const {
    data: auditLogs,
    isLoading: isLoadingAuditLogs
  } = useQuery({
    queryKey: ['auditLogs', id],
    queryFn: () => getCaseAuditLogs(id || ''),
    enabled: !!id && activeTab === 'history'
  });

  // Status change mutation
  const statusMutation = useMutation({
    mutationFn: ({ newStatus, notes }: { newStatus: CaseStatus, notes?: string }) => 
      updateCaseStatus(id || '', newStatus, user?.id || '', user?.name || '', notes),
    onSuccess: () => {
      toast.success('Case status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['criminal', id] });
      queryClient.invalidateQueries({ queryKey: ['statusHistory', id] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs', id] });
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  useEffect(() => {
    if (error) {
      toast.error('Failed to load case details');
    }
  }, [error]);

  const handleStatusChange = (newStatus: CaseStatus, notes?: string) => {
    if (!canChangeStatus()) {
      toast.error('You do not have permission to change case status');
      return;
    }
    
    statusMutation.mutate({ newStatus, notes });
  };

  const handlePrint = () => {
    // In a real app, this would generate a PDF
    setIsPrintDialogOpen(false);
    toast.success('Case report generated successfully');
  };

  // Keyboard shortcuts
  const shortcuts = [
    {
      key: 'e',
      description: 'Edit case',
      action: () => canChangeStatus() && navigate(`/cases/${id}/edit`)
    },
    {
      key: 'h',
      description: 'View history',
      action: () => setActiveTab('history')
    },
    {
      key: 'd',
      description: 'View details',
      action: () => setActiveTab('details')
    },
    {
      key: 'p',
      description: 'Print case report',
      action: () => setIsPrintDialogOpen(true)
    },
    {
      key: 'Backspace',
      description: 'Go back to case list',
      action: () => navigate('/cases')
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !criminal) {
    return (
      <div className="text-center py-12 text-red-500">
        Error loading case details. Please try again.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/cases')}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="text-2xl font-bold">{criminal.name}</h1>
          <StatusBadge status={criminal.status} size="lg" />
        </div>
        
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsPrintDialogOpen(true)}
            className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </motion.button>
          
          {canChangeStatus() && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/cases/${id}/edit`)}
              className="px-3 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Case</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Case Details
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Case History
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'details' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Case details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                  <p className="mt-1">{criminal.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Age</label>
                  <p className="mt-1">{criminal.age}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Father's Name</label>
                  <p className="mt-1">{criminal.fatherName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Gender</label>
                  <p className="mt-1">{criminal.gender.charAt(0).toUpperCase() + criminal.gender.slice(1)}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
                  <p className="mt-1">{criminal.address}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">ID Type</label>
                  <p className="mt-1">{criminal.idProof.type.toUpperCase()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">ID Number</label>
                  <p className="mt-1">{criminal.idProof.number}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Case Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">FIR Number</label>
                  <p className="mt-1">{criminal.firNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Police Station</label>
                  <p className="mt-1">{criminal.policeStation}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">District</label>
                  <p className="mt-1">{criminal.district}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">State</label>
                  <p className="mt-1">{criminal.state}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Identifiable Marks</label>
                  {criminal.identifiableMarks && criminal.identifiableMarks.length > 0 ? (
                    <ul className="mt-1 list-disc list-inside">
                      {criminal.identifiableMarks.map((mark, index) => (
                        <li key={index}>{mark}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-gray-500 dark:text-gray-400">None specified</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Warrants</h2>
              {criminal.warrants && criminal.warrants.length > 0 ? (
                <div className="space-y-4">
                  {criminal.warrants.map((warrant, index) => (
                    <div 
                      key={warrant.id || index} 
                      className={`p-4 rounded-lg border ${
                        warrant.isActive 
                          ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20' 
                          : 'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{warrant.court}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Case Number: {warrant.caseNumber}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Issued: {new Date(warrant.issuedDate).toLocaleDateString()}
                          </p>
                          <p className="mt-2">{warrant.details}</p>
                        </div>
                        {warrant.isActive && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-xs font-medium">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No warrants issued</p>
              )}
            </div>
          </div>

          {/* Right column - Status and metadata */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <CaseStatusSelector 
                currentStatus={criminal.status}
                onStatusChange={handleStatusChange}
                disabled={!canChangeStatus() || statusMutation.isPending}
              />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Case Metadata</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</p>
                    <p>{new Date(criminal.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</p>
                    <p>{new Date(criminal.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created By</p>
                    <p>User ID: {criminal.createdBy}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Jurisdiction</p>
                    <p>{criminal.district}, {criminal.state}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Photos</h2>
              <div className="space-y-3">
                {criminal.images && criminal.images.length > 0 ? (
                  criminal.images.map((image, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <img 
                        src={image.url} 
                        alt={`${criminal.name} - ${image.type}`} 
                        className="w-full h-auto rounded-lg object-cover"
                      />
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {image.type.charAt(0).toUpperCase() + image.type.slice(1)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No images available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Case History</h2>
            <div className="flex items-center space-x-2">
              <select
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value as any)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
              >
                <option value="all">All Events</option>
                <option value="status">Status Changes</option>
                <option value="edit">Edits</option>
                <option value="view">Views</option>
              </select>
            </div>
          </div>
          
          {isLoadingHistory || isLoadingAuditLogs ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <CaseHistoryTimeline 
              statusHistory={statusHistory || []}
              auditLogs={auditLogs || []}
              filter={historyFilter}
            />
          )}
        </div>
      )}

      {/* Print Dialog */}
      <ConfirmationDialog
        isOpen={isPrintDialogOpen}
        onClose={() => setIsPrintDialogOpen(false)}
        onConfirm={handlePrint}
        title="Generate Case Report"
        message="Choose the format for the case report."
        confirmText="Generate"
        cancelText="Cancel"
        type="info"
      >
        <div className="mt-4 space-y-4">
          <div className="flex items-center space-x-4">
            <button
              className="flex-1 p-4 border rounded-lg flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-primary-500"
            >
              <Printer className="w-8 h-8 mb-2 text-gray-500" />
              <span className="font-medium">Print</span>
              <span className="text-xs text-gray-500">Print directly</span>
            </button>
            <button
              className="flex-1 p-4 border rounded-lg flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-primary-500"
            >
              <Download className="w-8 h-8 mb-2 text-gray-500" />
              <span className="font-medium">PDF</span>
              <span className="text-xs text-gray-500">Download as PDF</span>
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Include Sections
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2">Personal Information</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2">Case Details</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2">Warrants</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2">Photos</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2">Status History</span>
              </label>
            </div>
          </div>
        </div>
      </ConfirmationDialog>

      <KeyboardShortcutsHelp shortcuts={shortcuts} />
    </motion.div>
  );
}