import { v4 as uuidv4 } from 'uuid';
import { 
  mockCriminals, 
  mockDistrictData, 
  mockDistrictOverview, 
  mockActivities, 
  mockAnalyticsData, 
  mockDashboardStats,
  mockAuditLogs,
  updateMockCriminal,
  addStatusChange,
  addAuditLog,
  getStatusHistory,
  getAuditLogs,
  getCasesByStatus
} from '../utils/mockData';
import { CaseFilter, CaseStatus, StatusChange } from '../types';

export async function getDashboardStats() {
  // Return mock dashboard stats
  return mockDashboardStats;
}

export async function getRecentActivities() {
  // Return mock recent activities
  return mockActivities.slice(0, 5);
}

export async function getDistrictAnalytics() {
  // Return mock district analytics
  return mockDistrictData;
}

export async function getDistrictOverview() {
  // Return mock district overview
  return mockDistrictOverview;
}

export async function searchCriminals(query: string | CaseFilter) {
  // If query is a string (simple search)
  if (typeof query === 'string') {
    // If query is empty or too short, return empty array
    if (!query || query.length < 3) return [];
    
    // Filter criminals based on query
    return mockCriminals.filter(criminal => 
      criminal.name.toLowerCase().includes(query.toLowerCase()) ||
      criminal.firNumber.toLowerCase().includes(query.toLowerCase()) ||
      criminal.idProof.number.toLowerCase().includes(query.toLowerCase())
    );
  } 
  // If query is a filter object (advanced search)
  else {
    let results = [...mockCriminals];
    
    // Apply status filter
    if (query.status) {
      results = results.filter(criminal => criminal.status === query.status);
    }
    
    // Apply district filter
    if (query.district) {
      results = results.filter(criminal => criminal.district.toLowerCase() === query.district.toLowerCase());
    }
    
    // Apply state filter
    if (query.state) {
      results = results.filter(criminal => criminal.state.toLowerCase() === query.state.toLowerCase());
    }
    
    // Apply date range filter
    if (query.dateFrom) {
      const fromDate = new Date(query.dateFrom);
      results = results.filter(criminal => new Date(criminal.createdAt) >= fromDate);
    }
    
    if (query.dateTo) {
      const toDate = new Date(query.dateTo);
      results = results.filter(criminal => new Date(criminal.createdAt) <= toDate);
    }
    
    // Apply warrant filter
    if (query.hasWarrant) {
      results = results.filter(criminal => 
        criminal.warrants.some(warrant => warrant.isActive)
      );
    }
    
    // Apply sorting
    if (query.sortBy) {
      results.sort((a, b) => {
        let comparison = 0;
        
        switch (query.sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'date':
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          case 'status':
            comparison = a.status.localeCompare(b.status);
            break;
        }
        
        return query.sortOrder === 'desc' ? -comparison : comparison;
      });
    }
    
    return results;
  }
}

export async function getAnalytics(type: 'daily' | 'weekly' | 'monthly') {
  // Return mock analytics data
  return mockAnalyticsData;
}

export async function addCriminal(criminalData: any) {
  // Simulate adding a criminal
  const newId = (mockCriminals.length + 1).toString();
  
  // Return success response
  return {
    success: true,
    message: 'Criminal record added successfully',
    _id: newId
  };
}

export async function updateCriminal(id: string, criminalData: any, userId: string, userName: string) {
  // Get the current criminal data
  const currentCriminal = mockCriminals.find(c => c._id === id);
  if (!currentCriminal) {
    throw new Error('Criminal record not found');
  }
  
  // Check if status is being updated
  if (criminalData.status && criminalData.status !== currentCriminal.status) {
    // Add status change history
    addStatusChange(
      id, 
      currentCriminal.status, 
      criminalData.status, 
      userId, 
      userName, 
      criminalData.statusNotes || 'Status updated'
    );
  } else {
    // For other field updates, add audit log
    for (const [key, value] of Object.entries(criminalData)) {
      if (key !== 'statusNotes' && currentCriminal[key] !== value) {
        addAuditLog(
          id,
          'update',
          key,
          currentCriminal[key],
          value,
          userId,
          userName
        );
      }
    }
    
    // Update the criminal record
    updateMockCriminal(id, {
      ...criminalData,
      lastUpdatedBy: userId
    });
  }
  
  // Return success response
  return {
    success: true,
    message: 'Criminal record updated successfully',
    _id: id
  };
}

export async function getCriminalDetails(id: string) {
  // Find criminal by ID
  const criminal = mockCriminals.find(c => c._id === id);
  
  if (!criminal) {
    throw new Error('Criminal record not found');
  }
  
  return criminal;
}

export async function updateCaseStatus(
  id: string, 
  newStatus: CaseStatus, 
  userId: string, 
  userName: string, 
  notes?: string
): Promise<StatusChange> {
  // Find criminal by ID
  const criminal = mockCriminals.find(c => c._id === id);
  
  if (!criminal) {
    throw new Error('Criminal record not found');
  }
  
  // Add status change
  const statusChange = addStatusChange(
    id,
    criminal.status,
    newStatus,
    userId,
    userName,
    notes || `Status changed from ${criminal.status} to ${newStatus}`
  );
  
  if (!statusChange) {
    throw new Error('Failed to update case status');
  }
  
  return statusChange;
}

export async function getCaseStatusHistory(id: string): Promise<StatusChange[]> {
  return getStatusHistory(id);
}

export async function getCaseAuditLogs(id: string, actionType?: string): Promise<any[]> {
  return getAuditLogs(id, actionType);
}

export async function getCasesByStatusType(status: CaseStatus): Promise<any[]> {
  return getCasesByStatus(status);
}

export async function getCaseStatistics() {
  const activeCases = mockCriminals.filter(c => c.status === 'active').length;
  const closedCases = mockCriminals.filter(c => c.status === 'closed').length;
  const arrestedCases = mockCriminals.filter(c => c.status === 'arrested').length;
  const totalCases = mockCriminals.length;
  const activeWarrants = mockCriminals.reduce((count, criminal) => {
    return count + criminal.warrants.filter(w => w.isActive).length;
  }, 0);
  
  return {
    activeCases,
    closedCases,
    arrestedCases,
    totalCases,
    activeWarrants
  };
}