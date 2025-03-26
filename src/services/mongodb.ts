import axios from 'axios';
import { CaseFilter, CaseStatus, StatusChange } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Configure axios
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function getDashboardStats() {
  try {
    const response = await axios.get(`${API_URL}/criminals/stats`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

export async function getRecentActivities() {
  try {
    const response = await axios.get(`${API_URL}/criminals/activities`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error;
  }
}

export async function getDistrictAnalytics() {
  try {
    const response = await axios.get(`${API_URL}/criminals/district-analytics`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching district analytics:', error);
    throw error;
  }
}

export async function getDistrictOverview() {
  try {
    const response = await axios.get(`${API_URL}/criminals/district-overview`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching district overview:', error);
    throw error;
  }
}

export async function searchCriminals(query: string | CaseFilter) {
  try {
    let url = `${API_URL}/criminals`;
    
    if (typeof query === 'string') {
      if (!query || query.length < 3) return [];
      url = `${API_URL}/criminals/search?q=${encodeURIComponent(query)}`;
    } else {
      url = `${API_URL}/criminals?${new URLSearchParams(query as any).toString()}`;
    }
    
    const response = await axios.get(url);
    return response.data.data;
  } catch (error) {
    console.error('Error searching criminals:', error);
    throw error;
  }
}

export async function getAnalytics(type: 'daily' | 'weekly' | 'monthly') {
  try {
    const response = await axios.get(`${API_URL}/criminals/analytics?type=${type}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
}

export async function addCriminal(criminalData: any) {
  try {
    const response = await axios.post(`${API_URL}/criminals`, criminalData);
    return response.data;
  } catch (error) {
    console.error('Error adding criminal:', error);
    throw error;
  }
}

export async function updateCriminal(id: string, criminalData: any, userId: string, userName: string) {
  try {
    const response = await axios.put(`${API_URL}/criminals/${id}`, criminalData);
    return response.data;
  } catch (error) {
    console.error('Error updating criminal:', error);
    throw error;
  }
}

export async function getCriminalDetails(id: string) {
  try {
    const response = await axios.get(`${API_URL}/criminals/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching criminal details:', error);
    throw error;
  }
}

export async function updateCaseStatus(
  id: string, 
  newStatus: CaseStatus, 
  userId: string, 
  userName: string, 
  notes?: string
): Promise<StatusChange> {
  try {
    const response = await axios.put(`${API_URL}/criminals/${id}/status`, {
      status: newStatus,
      notes
    });
    return response.data.data;
  } catch (error) {
    console.error('Error updating case status:', error);
    throw error;
  }
}

export async function getCaseStatusHistory(id: string): Promise<StatusChange[]> {
  try {
    const response = await axios.get(`${API_URL}/criminals/${id}/status-history`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching status history:', error);
    throw error;
  }
}

export async function getCaseAuditLogs(id: string, actionType?: string): Promise<any[]> {
  try {
    const url = actionType 
      ? `${API_URL}/criminals/${id}/audit-logs?type=${actionType}`
      : `${API_URL}/criminals/${id}/audit-logs`;
    const response = await axios.get(url);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
}

export async function getCasesByStatusType(status: CaseStatus): Promise<any[]> {
  try {
    const response = await axios.get(`${API_URL}/criminals?status=${status}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching cases by status:', error);
    throw error;
  }
}

export async function getCaseStatistics() {
  try {
    const response = await axios.get(`${API_URL}/criminals/statistics`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching case statistics:', error);
    throw error;
  }
}