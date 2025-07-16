// src/utils/adzunaApi.js - Complete file with all functions
import axios from 'axios';

const BACKEND_URL = 'http://localhost:5000/api/jobs/adzuna';

export const fetchAdzunaJobs = async (query = '', location = '', page = 1) => {
  try {
    console.log('🔍 Fetching jobs from backend...', { query, location, page });
    
    const response = await axios.get(BACKEND_URL, {
      params: {
        query,
        location,
        page
      },
      timeout: 10000 // 10 second timeout
    });
    
    console.log('✅ Backend response:', response.data);
    console.log('📊 Jobs count:', response.data.jobs?.length || 0);
    console.log('📊 Raw response:', response.data.rawResponse); // Debug info
    
    if (response.data.success) {
      return {
        jobs: response.data.jobs || [],
        total: response.data.total || 0,
        page: response.data.page || 1,
        totalPages: response.data.totalPages || 1
      };
    } else {
      console.error('❌ Backend error:', response.data.error);
      console.error('❌ Backend details:', response.data.details);
      throw new Error(response.data.error || 'Failed to fetch jobs');
    }
    
  } catch (error) {
    console.error('❌ Backend API error:', error?.response?.data || error.message);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - please try again');
    }
    
    if (error.response?.status === 500) {
      throw new Error('Server error - please try again later');
    }
    
    throw new Error(error.message || 'Failed to fetch jobs');
  }
};

// Test function to check if backend is running
export const testBackendConnection = async () => {
  try {
    const response = await axios.get('http://localhost:5000/health');
    console.log('✅ Backend health check:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Backend not accessible:', error.message);
    return false;
  }
};