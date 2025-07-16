import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jobAPI } from '../../utils/api';
import { toast } from 'react-hot-toast';

// Async thunks
export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await jobAPI.getJobs(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch jobs');
    }
  }
);

export const fetchJobDetail = createAsyncThunk(
  'jobs/fetchJobDetail',
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await jobAPI.getJob(jobId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch job details');
    }
  }
);

export const createJob = createAsyncThunk(
  'jobs/createJob',
  async (jobData, { rejectWithValue }) => {
    try {
      const response = await jobAPI.createJob(jobData);
      toast.success('Job posted successfully!');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create job';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const applyForJob = createAsyncThunk(
  'jobs/applyForJob',
  async ({ jobId, applicationData }, { rejectWithValue }) => {
    try {
      await jobAPI.applyForJob(jobId, applicationData);
      toast.success('Application submitted successfully!');
      return jobId;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit application';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateJob = createAsyncThunk(
  'jobs/updateJob',
  async ({ jobId, jobData }, { rejectWithValue }) => {
    try {
      const response = await jobAPI.updateJob(jobId, jobData);
      toast.success('Job updated successfully!');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update job';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteJob = createAsyncThunk(
  'jobs/deleteJob',
  async (jobId, { rejectWithValue }) => {
    try {
      await jobAPI.deleteJob(jobId);
      toast.success('Job deleted successfully!');
      return jobId;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete job';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  jobs: [],
  currentJob: null,
  isLoading: false,
  isCreating: false,
  isApplying: false,
  error: null,
  filters: {
    search: '',
    location: '',
    type: '',
    remote: false,
    experienceLevel: ''
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  }
};

const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentJob: (state) => {
      state.currentJob = null;
    },
    resetJobs: (state) => {
      state.jobs = [];
      state.pagination = {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch jobs
      .addCase(fetchJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch job detail
      .addCase(fetchJobDetail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJobDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentJob = action.payload;
      })
      .addCase(fetchJobDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create job
      .addCase(createJob.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.isCreating = false;
        state.jobs.unshift(action.payload);
      })
      .addCase(createJob.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      
      // Apply for job
      .addCase(applyForJob.pending, (state) => {
        state.isApplying = true;
        state.error = null;
      })
      .addCase(applyForJob.fulfilled, (state, action) => {
        state.isApplying = false;
        // Update the current job if it's the one we applied to
        if (state.currentJob && state.currentJob._id === action.payload) {
          state.currentJob.hasApplied = true;
          state.currentJob.applicationCount = (state.currentJob.applicationCount || 0) + 1;
        }
      })
      .addCase(applyForJob.rejected, (state, action) => {
        state.isApplying = false;
        state.error = action.payload;
      })
      
      // Update job
      .addCase(updateJob.fulfilled, (state, action) => {
        const index = state.jobs.findIndex(job => job._id === action.payload._id);
        if (index !== -1) {
          state.jobs[index] = action.payload;
        }
        if (state.currentJob && state.currentJob._id === action.payload._id) {
          state.currentJob = action.payload;
        }
      })
      
      // Delete job
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter(job => job._id !== action.payload);
        if (state.currentJob && state.currentJob._id === action.payload) {
          state.currentJob = null;
        }
      });
  },
});

export const { clearError, setFilters, clearCurrentJob, resetJobs } = jobSlice.actions;
export default jobSlice.reducer;