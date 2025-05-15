import { api } from './api';
import fs from 'fs';
import path from 'path';

export interface CriminalData {
  name: string;
  description: string;
  status: string;
  [key: string]: any;
}

export const addCriminal = async (formData: FormData) => {
  try {
    const response = await api.post('/criminals', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating criminal record:', error);
    throw error;
  }
};

export const getCriminalById = async (id: string) => {
  try {
    const response = await api.get(`/criminals/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error getting criminal by ID:', error);
    throw error;
  }
};

export const searchCriminals = async (query: Record<string, any> = {}) => {
  try {
    const response = await api.get('/criminals/search', { params: query });
    return response.data;
  } catch (error) {
    console.error('Error searching criminals:', error);
    throw error;
  }
};

export const getImageUrl = (imageId: string) => {
  return `/api/criminals/images/${imageId}`;
};

export const getDocumentUrl = (docId: string) => {
  return `/api/criminals/documents/${docId}`;
};