import express from 'express';
import multer from 'multer';
import User from '../models/User.js';
import Post from '../models/Post.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// @route   GET /api/users/profile/:id
// @desc    Get user profile
// @access  Public
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('connections.user', 'firstName lastName profilePicture headline')
      .populate('following', 'firstName lastName profilePicture headline')
      .populate('followers', 'firstName lastName profilePicture headline');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User profile not available'
      });
    }

    // Get user's posts
    const posts = await Post.find({ author: user._id, isActive: true })
      .populate('author', 'firstName lastName profilePicture headline')
      .populate('likes.user', 'firstName lastName profilePicture')
      .populate('comments.user', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        user: user.getPublicProfile(),
        posts,
        stats: {
          postsCount: posts.length,
          connectionsCount: user.connections.filter(conn => conn.status === 'accepted').length,
          followersCount: user.followers.length,
          followingCount: user.following.length
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      headline,
      summary,
      location,
      industry,
      experience,
      education,
      skills
    } = req.body;

    const updateData = {};
    
    if (firstName) updateData.firstName = firstName.trim();
    if (lastName) updateData.lastName = lastName.trim();
    if (headline !== undefined) updateData.headline = headline.trim();
    if (summary !== undefined) updateData.summary = summary.trim();
    if (location !== undefined) updateData.location = location.trim();
    if (industry !== undefined) updateData.industry = industry.trim();
    if (experience) updateData.experience = experience;
    if (education) updateData.education = education;
    if (skills) updateData.skills = skills;

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/users/upload-profile-picture
// @desc    Upload profile picture
// @access  Private
router.post('/upload-profile-picture', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const profilePictureUrl = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { profilePicture: profilePictureUrl },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profilePicture: profilePictureUrl,
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/users/upload-cover-photo
// @desc    Upload cover photo
// @access  Private
router.post('/upload-cover-photo', auth, upload.single('coverPhoto'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const coverPhotoUrl = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { coverPhoto: coverPhotoUrl },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Cover photo uploaded successfully',
      data: {
        coverPhoto: coverPhotoUrl,
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Upload cover photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/search
// @desc    Search users
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, industry, location, page = 1, limit = 20 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const query = {
      isActive: true,
      $or: [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { headline: { $regex: q, $options: 'i' } },
        { skills: { $in: [new RegExp(q, 'i')] } }
      ]
    };

    if (industry) {
      query.industry = { $regex: industry, $options: 'i' };
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(query)
        .select('firstName lastName headline profilePicture location industry')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ firstName: 1, lastName: 1 }),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/users/connect/:id
// @desc    Send connection request
// @access  Private
router.post('/connect/:id', auth, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.userId;

    if (targetUserId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot connect to yourself'
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser || !targetUser.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const currentUser = await User.findById(currentUserId);
    
    // Check if connection already exists
    const existingConnection = currentUser.connections.find(
      conn => conn.user.toString() === targetUserId
    );

    if (existingConnection) {
      return res.status(400).json({
        success: false,
        message: 'Connection request already exists'
      });
    }

    // Add connection request
    currentUser.connections.push({
      user: targetUserId,
      status: 'pending'
    });

    // Add reverse connection request
    targetUser.connections.push({
      user: currentUserId,
      status: 'pending'
    });

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.json({
      success: true,
      message: 'Connection request sent successfully'
    });
  } catch (error) {
    console.error('Send connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/connection/:id/:action
// @desc    Accept or decline connection request
// @access  Private
router.put('/connection/:id/:action', auth, async (req, res) => {
  try {
    const { id: connectionUserId, action } = req.params;
    const currentUserId = req.userId;

    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
    }

    const currentUser = await User.findById(currentUserId);
    const connectionUser = await User.findById(connectionUserId);

    if (!connectionUser || !connectionUser.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find the connection request
    const currentUserConnection = currentUser.connections.find(
      conn => conn.user.toString() === connectionUserId && conn.status === 'pending'
    );

    const connectionUserConnection = connectionUser.connections.find(
      conn => conn.user.toString() === currentUserId && conn.status === 'pending'
    );

    if (!currentUserConnection || !connectionUserConnection) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found'
      });
    }

    if (action === 'accept') {
      currentUserConnection.status = 'accepted';
      connectionUserConnection.status = 'accepted';
    } else {
      // Remove the connection requests
      currentUser.connections = currentUser.connections.filter(
        conn => conn.user.toString() !== connectionUserId
      );
      connectionUser.connections = connectionUser.connections.filter(
        conn => conn.user.toString() !== currentUserId
      );
    }

    await Promise.all([currentUser.save(), connectionUser.save()]);

    res.json({
      success: true,
      message: `Connection request ${action}ed successfully`
    });
  } catch (error) {
    console.error('Connection action error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/connections
// @desc    Get user connections
// @access  Private
router.get('/connections', auth, async (req, res) => {
  try {
    const { status = 'accepted', page = 1, limit = 20 } = req.query;
    
    const user = await User.findById(req.userId)
      .populate({
        path: 'connections.user',
        select: 'firstName lastName profilePicture headline location industry',
        match: { isActive: true }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let connections = user.connections.filter(conn => 
      conn.status === status && conn.user
    );

    const total = connections.length;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    connections = connections.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        connections,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/users/connection/:id
// @desc    Remove connection
// @access  Private
router.delete('/connection/:id', auth, async (req, res) => {
  try {
    const connectionUserId = req.params.id;
    const currentUserId = req.userId;

    const currentUser = await User.findById(currentUserId);
    const connectionUser = await User.findById(connectionUserId);

    if (!connectionUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove connections from both users
    currentUser.connections = currentUser.connections.filter(
      conn => conn.user.toString() !== connectionUserId
    );

    connectionUser.connections = connectionUser.connections.filter(
      conn => conn.user.toString() !== currentUserId
    );

    await Promise.all([currentUser.save(), connectionUser.save()]);

    res.json({
      success: true,
      message: 'Connection removed successfully'
    });
  } catch (error) {
    console.error('Remove connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;