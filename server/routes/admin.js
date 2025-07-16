import express from 'express';
import { auth, adminAuth } from '../middleware/auth.js';
import { validate } from '../utils/validation.js';
import { asyncHandler } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Job from '../models/Job.js';
import Company from '../models/Company.js';

const router = express.Router();

// Admin dashboard stats
router.get('/dashboard', auth, adminAuth, asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalPosts,
    totalJobs,
    totalCompanies,
    newUsersThisMonth,
    activeUsersToday
  ] = await Promise.all([
    User.countDocuments(),
    Post.countDocuments(),
    Job.countDocuments(),
    Company.countDocuments(),
    User.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(1)) }
    }),
    User.countDocuments({
      lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    })
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalPosts,
      totalJobs,
      totalCompanies,
      newUsersThisMonth,
      activeUsersToday
    }
  });
}));

// Get all users with pagination
router.get('/users', auth, adminAuth, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, status } = req.query;
  const skip = (page - 1) * limit;

  const query = {};
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  if (status) {
    query.status = status;
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
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
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// Update user status
router.patch('/users/:id/status', auth, adminAuth, asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  if (!['active', 'suspended', 'banned'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status'
    });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status, updatedAt: new Date() },
    { new: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  logger.info(`Admin ${req.userId} updated user ${user._id} status to ${status}`);

  res.json({
    success: true,
    data: user
  });
}));

// Delete user
router.delete('/users/:id', auth, adminAuth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Delete user's posts, jobs, etc.
  await Promise.all([
    Post.deleteMany({ author: user._id }),
    Job.deleteMany({ postedBy: user._id })
  ]);

  await User.findByIdAndDelete(req.params.id);

  logger.info(`Admin ${req.userId} deleted user ${user._id}`);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
}));

// Get all posts with moderation
router.get('/posts', auth, adminAuth, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const skip = (page - 1) * limit;

  const query = {};
  if (status) {
    query.status = status;
  }

  const [posts, total] = await Promise.all([
    Post.find(query)
      .populate('author', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Post.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: {
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// Moderate post
router.patch('/posts/:id/moderate', auth, adminAuth, asyncHandler(async (req, res) => {
  const { action, reason } = req.body;
  
  if (!['approve', 'reject', 'flag'].includes(action)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid action'
    });
  }

  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { 
      status: action === 'approve' ? 'active' : 'moderated',
      moderationReason: reason,
      moderatedBy: req.userId,
      moderatedAt: new Date()
    },
    { new: true }
  ).populate('author', 'firstName lastName email');

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  logger.info(`Admin ${req.userId} ${action}ed post ${post._id}`);

  res.json({
    success: true,
    data: post
  });
}));

// System logs
router.get('/logs', auth, adminAuth, asyncHandler(async (req, res) => {
  const { level = 'info', page = 1, limit = 50 } = req.query;
  
  // This would typically read from your log files or log database
  // For now, return a mock response
  res.json({
    success: true,
    data: {
      logs: [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 0,
        pages: 0
      }
    }
  });
}));

// System health
router.get('/health', auth, adminAuth, asyncHandler(async (req, res) => {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();

  res.json({
    success: true,
    data: {
      uptime,
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024)
      },
      nodeVersion: process.version,
      platform: process.platform,
      environment: process.env.NODE_ENV
    }
  });
}));

export default router;