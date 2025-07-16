import axios from 'axios';

// ✅ You need to add your actual APP_ID here
const APP_ID = '15fee112'; // ⚠️ This is empty in your code!
const APP_KEY = 'f6234f957d74a440ffb2ce1dd2adf2c4';

const BASE_URL = 'https://api.adzuna.com/v1/api/jobs/in/search';

export const fetchAdzunaJobs = async (query = '', location = '', page = 1) => {
  try {
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

    return response.data.results || [];
  } catch (error) {
    console.error('Adzuna API error:', error?.response?.data || error.message);
    return [];
  }
};
