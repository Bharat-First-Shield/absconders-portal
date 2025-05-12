import React from 'react';
import { motion } from 'framer-motion';
import { StatusChange, AuditLog } from '../types';
import { Clock, User, FileText, Edit, Eye, AlertCircle } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface CaseHistoryTimelineProps {
  statusHistory: StatusChange[];
  auditLogs?: AuditLog[];
  filter?: 'all' | 'status' | 'edit' | 'view';
}

export function CaseHistoryTimeline({ 
  statusHistory, 
  auditLogs = [], 
  filter = 'all' 
}: CaseHistoryTimelineProps) {
  // Combine status history and audit logs
  const allEvents = [...statusHistory, ...auditLogs].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Filter events based on the filter type
  const filteredEvents = allEvents.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'status' && 'previousStatus' in event) return true;
    if (filter === 'edit' && 'action' in event && event.action === 'update') return true;
    if (filter === 'view' && 'action' in event && event.action === 'view') return true;
    return false;
  });

  if (filteredEvents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No history records found.
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {filteredEvents.map((event, eventIdx) => (
          <motion.li 
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: eventIdx * 0.1 }}
          >
            <div className="relative pb-8">
              {eventIdx !== filteredEvents.length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-800 ${
                    'previousStatus' in event 
                      ? 'bg-blue-500' 
                      : 'action' in event && event.action === 'update'
                      ? 'bg-amber-500'
                      : 'bg-gray-400'
                  }`}>
                    {
                      'previousStatus' in event ? (
                        <AlertCircle className="h-5 w-5 text-white" aria-hidden="true" />
                      ) : 'action' in event && event.action === 'update' ? (
                        <Edit className="h-5 w-5 text-white" aria-hidden="true" />
                      ) : 'action' in event && event.action === 'view' ? (
                        <Eye className="h-5 w-5 text-white" aria-hidden="true" />
                      ) : (
                        <FileText className="h-5 w-5 text-white" aria-hidden="true" />
                      )
                    }
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {
                        'previousStatus' in event ? (
                          <>
                            Status changed from <StatusBadge status={event.previousStatus} size="sm" /> to <StatusBadge status={event.newStatus} size="sm" />
                            {event.notes && (
                              <span className="block mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Note: {event.notes}
                              </span>
                            )}
                          </>
                        ) : 'action' in event ? (
                          <>
                            {event.action === 'update' && (
                              <>
                                Updated {event.field} from "{event.previousValue}" to "{event.newValue}"
                              </>
                            )}
                            {event.action === 'view' && (
                              <>
                                Viewed case details
                              </>
                            )}
                            {event.action === 'create' && (
                              <>
                                Created case record
                              </>
                            )}
                          </>
                        ) : (
                          'Unknown event'
                        )
                      }
                    </p>
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <time dateTime={new Date(event.timestamp).toISOString()}>
                        {new Date(event.timestamp).toLocaleString()}
                      </time>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <User className="w-3 h-3" />
                      <span>
                        {'changedByName' in event ? event.changedByName : 'performedByName' in event ? event.performedByName : 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}