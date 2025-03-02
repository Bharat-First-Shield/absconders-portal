import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CaseStatus } from '../types';
import { ConfirmationDialog } from './ConfirmationDialog';
import { StatusBadge } from './StatusBadge';

interface CaseStatusSelectorProps {
  currentStatus: CaseStatus;
  onStatusChange: (newStatus: CaseStatus, notes?: string) => void;
  disabled?: boolean;
}

export function CaseStatusSelector({ 
  currentStatus, 
  onStatusChange,
  disabled = false
}: CaseStatusSelectorProps) {
  const [selectedStatus, setSelectedStatus] = useState<CaseStatus | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusNotes, setStatusNotes] = useState('');

  const statusOptions: { value: CaseStatus; label: string; description: string }[] = [
    { 
      value: 'active', 
      label: 'Active', 
      description: 'Case is ongoing and the suspect is at large' 
    },
    { 
      value: 'arrested', 
      label: 'Arrested', 
      description: 'Suspect has been apprehended' 
    },
    { 
      value: 'closed', 
      label: 'Closed', 
      description: 'Case has been closed (e.g., insufficient evidence, charges dropped)' 
    }
  ];

  const handleStatusSelect = (status: CaseStatus) => {
    if (status === currentStatus || disabled) return;
    
    setSelectedStatus(status);
    setIsDialogOpen(true);
  };

  const handleConfirmStatusChange = () => {
    if (selectedStatus) {
      onStatusChange(selectedStatus, statusNotes);
      setStatusNotes('');
      setSelectedStatus(null);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Case Status
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {statusOptions.map((option) => (
            <motion.div
              key={option.value}
              whileHover={!disabled ? { scale: 1.02 } : {}}
              whileTap={!disabled ? { scale: 0.98 } : {}}
              onClick={() => handleStatusSelect(option.value)}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                currentStatus === option.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">{option.label}</span>
                  <StatusBadge status={option.value} />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {option.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setStatusNotes('');
        }}
        onConfirm={handleConfirmStatusChange}
        title="Change Case Status"
        message={`Are you sure you want to change the status from "${currentStatus}" to "${selectedStatus}"?`}
        confirmText="Change Status"
        cancelText="Cancel"
        type="warning"
      >
        <div className="mt-4">
          <label htmlFor="statusNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Notes (Optional)
          </label>
          <textarea
            id="statusNotes"
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            placeholder="Add notes about this status change..."
            value={statusNotes}
            onChange={(e) => setStatusNotes(e.target.value)}
          />
        </div>
      </ConfirmationDialog>
    </>
  );
}