import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userAPI } from '../../utils/api';
import { toast } from 'react-hot-toast';

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userAPI.getProfile(userId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await userAPI.updateProfile(profileData);
      toast.success('Profile updated successfully!');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const uploadProfilePicture = createAsyncThunk(
  'user/uploadProfilePicture',
  async (file, { rejectWithValue }) => {
    try {
      const response = await userAPI.uploadProfilePicture(file);
      toast.success('Profile picture updated!');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to upload profile picture';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const uploadCoverPhoto = createAsyncThunk(
  'user/uploadCoverPhoto',
  async (file, { rejectWithValue }) => {
    try {
      const response = await userAPI.uploadCoverPhoto(file);
      toast.success('Cover photo updated!');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to upload cover photo';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const searchUsers = createAsyncThunk(
  'user/searchUsers',
  async (query, { rejectWithValue }) => {
    try {
      const response = await userAPI.searchUsers(query);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search users');
    }
  }
);

export const sendConnectionRequest = createAsyncThunk(
  'user/sendConnectionRequest',
  async (userId, { rejectWithValue }) => {
    try {
      await userAPI.sendConnectionRequest(userId);
      toast.success('Connection request sent!');
      return userId;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send connection request';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchConnections = createAsyncThunk(
  'user/fetchConnections',
  async (status = 'accepted', { rejectWithValue }) => {
    try {
      const response = await userAPI.getConnections(status);
      return { status, connections: response.data.data.connections };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch connections');
    }
  }
);

const initialState = {
  currentProfile: null,
  searchResults: [],
  connections: [],
  pendingConnections: [],
  isLoading: false,
  isUploading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProfile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProfile = { ...state.currentProfile, ...action.payload };
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Upload profile picture
      .addCase(uploadProfilePicture.pending, (state) => {
        state.isUploading = true;
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        state.isUploading = false;
        if (state.currentProfile) {
          state.currentProfile.profilePicture = action.payload.profilePicture;
        }
      })
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload;
      })
      
      // Upload cover photo
      .addCase(uploadCoverPhoto.pending, (state) => {
        state.isUploading = true;
      })
      .addCase(uploadCoverPhoto.fulfilled, (state, action) => {
        state.isUploading = false;
        if (state.currentProfile) {
          state.currentProfile.coverPhoto = action.payload.coverPhoto;
        }
      })
      .addCase(uploadCoverPhoto.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload;
      })
      
      // Search users
      .addCase(searchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload.users;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Send connection request
      .addCase(sendConnectionRequest.fulfilled, (state, action) => {
        state.searchResults = state.searchResults.filter(
          user => user._id !== action.payload
        );
      })
      
      // Fetch connections
      .addCase(fetchConnections.fulfilled, (state, action) => {
        const { status, connections } = action.payload;
        if (status === 'accepted') {
          state.connections = connections;
        } else if (status === 'pending') {
          state.pendingConnections = connections;
        }
      });
  },
});

export const { clearError, clearSearchResults } = userSlice.actions;
export default userSlice.reducer;