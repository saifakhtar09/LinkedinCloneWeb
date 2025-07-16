const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Your Adzuna credentials
const APP_ID = '15fee112';
const APP_KEY = 'f6234f957d74a440ffb2ce1dd2adf2c4';
const BASE_URL = 'https://api.adzuna.com/v1/api/jobs/in/search';

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running!', timestamp: new Date().toISOString() });
});

// Jobs endpoint
app.get('/api/jobs/adzuna', async (req, res) => {
  try {
    const { query = '', location = '', page = 1 } = req.query;
    
    console.log('🔍 Fetching jobs from Adzuna API...', { query, location, page });
    console.log('📡 Request URL:', `${BASE_URL}/${page}`);
    console.log('📋 Request params:', {
      app_id: APP_ID,
      app_key: APP_KEY,
      what: query,
      where: location,
      results_per_page: 20,
      content_type: 'application/json'
    });
    
    const response = await axios.get(`${BASE_URL}/${page}`, {
      params: {
        app_id: APP_ID,
        app_key: APP_KEY,
        what: query,
        where: location,
        results_per_page: 20,
        content_type: 'application/json'
      }
    });
    
    console.log('📊 Adzuna API response status:', response.status);
    console.log('📊 Adzuna API response data:', JSON.stringify(response.data, null, 2));
    console.log('✅ Jobs fetched successfully:', response.data.results?.length || 0);
    
    // Check if response has the expected structure
    if (!response.data || !response.data.results) {
      console.warn('⚠️ Unexpected response structure:', response.data);
    }
    
    res.json({
      success: true,
      jobs: response.data.results || [],
      total: response.data.count || 0,
      page: parseInt(page),
      totalPages: Math.ceil((response.data.count || 0) / 20),
      rawResponse: response.data // Include raw response for debugging
    });
    
  } catch (error) {
    console.error('❌ Adzuna API error details:');
    console.error('Status:', error?.response?.status);
    console.error('Data:', error?.response?.data);
    console.error('Message:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch jobs',
      details: error?.response?.data || error.message,
      status: error?.response?.status
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Jobs API: http://localhost:${PORT}/api/jobs/adzuna`);
});

// This file goes in: backend/server.js
// Run: cd backend && npm install express axios cors nodemon
// Start: cd backend && npm run dev