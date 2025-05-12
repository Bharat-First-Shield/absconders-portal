import { api } from './api';
import { CaseFilter, CaseStatus, StatusChange } from '../types';
import fs from 'fs';
import path from 'path';

// Helper function to get criminals data from JSON file
const getCriminalsData = () => {
  try {
    const data = fs.readFileSync(path.join(process.cwd(), 'data/criminals.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading criminals data:', error);
    return [];
  }
};

export async function getDashboardStats() {
  const criminals = getCriminalsData();
  
  const stats = {
    totalCases: criminals.length,
    activeCases: criminals.filter(c => c.status === 'active').length,
    closedCases: criminals.filter(c => c.status === 'closed').length,
    arrestedCases: criminals.filter(c => c.status === 'arrested').length,
    activeWarrants: criminals.filter(c => c.warrants.some(w => w.isActive)).length,
    searchCount: criminals.length, // Using total count as search count
    districtCount: new Set(criminals.map(c => c.district)).size
  };
  
  return stats;
}

export async function getRecentActivities() {
  const criminals = getCriminalsData();
  
  // Get recent status changes from criminal history
  const activities = criminals
    .flatMap(criminal => 
      (criminal.statusHistory || []).map(history => ({
        id: history.id,
        description: `Changed status from ${history.previousStatus} to ${history.newStatus} for ${criminal.name}`,
        timestamp: new Date(history.timestamp),
        userId: history.changedBy,
        userName: history.changedByName,
        actionType: 'status_change'
      }))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);
  
  return activities;
}

export async function getDistrictAnalytics() {
  const criminals = getCriminalsData();
  
  // Group by district and calculate metrics
  const districtMap = new Map();
  
  criminals.forEach(criminal => {
    const district = criminal.district;
    if (!districtMap.has(district)) {
      districtMap.set(district, {
        _id: district,
        totalCases: 0,
        activeWarrants: 0,
        activeCases: 0,
        closedCases: 0,
        arrestedCases: 0
      });
    }
    
    const stats = districtMap.get(district);
    stats.totalCases++;
    
    if (criminal.warrants.some(w => w.isActive)) {
      stats.activeWarrants++;
    }
    
    switch (criminal.status) {
      case 'active':
        stats.activeCases++;
        break;
      case 'closed':
        stats.closedCases++;
        break;
      case 'arrested':
        stats.arrestedCases++;
        break;
    }
  });
  
  return Array.from(districtMap.values());
}

export async function getDistrictOverview() {
  const criminals = getCriminalsData();
  
  // Group by district and count cases
  const districtCounts = criminals.reduce((acc, criminal) => {
    const district = criminal.district;
    if (!acc[district]) {
      acc[district] = { _id: district, caseCount: 0 };
    }
    acc[district].caseCount++;
    return acc;
  }, {});
  
  return Object.values(districtCounts)
    .sort((a: any, b: any) => b.caseCount - a.caseCount);
}

export async function searchCriminals(query: string | CaseFilter) {
  const criminals = getCriminalsData();
  
  if (typeof query === 'string') {
    const searchTerm = query.toLowerCase();
    return criminals.filter(criminal => 
      criminal.name.toLowerCase().includes(searchTerm) ||
      criminal.firNumber.toLowerCase().includes(searchTerm)
    );
  } else {
    return criminals.filter(criminal => {
      for (const [key, value] of Object.entries(query)) {
        if (value) {
          switch (key) {
            case 'status':
              if (criminal.status !== value) return false;
              break;
            case 'district':
              if (criminal.district !== value) return false;
              break;
            case 'state':
              if (criminal.state !== value) return false;
              break;
            case 'hasWarrant':
              if (value && !criminal.warrants.some(w => w.isActive)) return false;
              break;
          }
        }
      }
      return true;
    });
  }
}

export async function getAnalytics(type: 'daily' | 'weekly' | 'monthly') {
  const criminals = getCriminalsData();
  
  // Group by date based on createdAt
  const dateGroups = criminals.reduce((acc, criminal) => {
    const date = new Date(criminal.createdAt);
    const dateKey = date.toISOString().split('T')[0];
    
    if (!acc[dateKey]) {
      acc[dateKey] = {
        _id: dateKey,
        newCases: 0,
        activeWarrants: 0,
        activeCases: 0,
        closedCases: 0,
        arrestedCases: 0
      };
    }
    
    const stats = acc[dateKey];
    stats.newCases++;
    
    if (criminal.warrants.some(w => w.isActive)) {
      stats.activeWarrants++;
    }
    
    switch (criminal.status) {
      case 'active':
        stats.activeCases++;
        break;
      case 'closed':
        stats.closedCases++;
        break;
      case 'arrested':
        stats.arrestedCases++;
        break;
    }
    
    return acc;
  }, {});
  
  return Object.values(dateGroups)
    .sort((a: any, b: any) => a._id.localeCompare(b._id));
}

export async function getCaseStatistics() {
  const criminals = getCriminalsData();
  
  return {
    activeCases: criminals.filter(c => c.status === 'active').length,
    arrestedCases: criminals.filter(c => c.status === 'arrested').length,
    closedCases: criminals.filter(c => c.status === 'closed').length
  };
}

export async function getCriminalDetails(id: string) {
  const criminals = getCriminalsData();
  return criminals.find(c => c.id === id);
}

export async function updateCaseStatus(
  id: string,
  newStatus: CaseStatus,
  userId: string,
  userName: string,
  notes?: string
): Promise<StatusChange> {
  const criminals = getCriminalsData();
  const criminal = criminals.find(c => c.id === id);
  
  if (!criminal) {
    throw new Error('Criminal not found');
  }
  
  const statusChange: StatusChange = {
    id: Date.now().toString(),
    criminalId: id,
    previousStatus: criminal.status,
    newStatus,
    changedBy: userId,
    changedByName: userName,
    timestamp: new Date(),
    notes
  };
  
  criminal.status = newStatus;
  criminal.statusHistory = [...(criminal.statusHistory || []), statusChange];
  
  // Save updated data
  fs.writeFileSync(
    path.join(process.cwd(), 'data/criminals.json'),
    JSON.stringify(criminals, null, 2)
  );
  
  return statusChange;
}

export async function getCaseStatusHistory(id: string): Promise<StatusChange[]> {
  const criminals = getCriminalsData();
  const criminal = criminals.find(c => c.id === id);
  return criminal?.statusHistory || [];
}

export async function getCaseAuditLogs(id: string, actionType?: string): Promise<any[]> {
  const criminals = getCriminalsData();
  const criminal = criminals.find(c => c.id === id);
  let logs = criminal?.auditLogs || [];
  
  if (actionType) {
    logs = logs.filter(log => log.action === actionType);
  }
  
  return logs;
}

export async function getCasesByStatusType(status: CaseStatus): Promise<any[]> {
  const criminals = getCriminalsData();
  return criminals.filter(c => c.status === status);
}