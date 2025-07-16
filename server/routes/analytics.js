import express from 'express';
import { auth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/helpers.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Job from '../models/Job.js';

const router = express.Router();

// User analytics
router.get('/user/:id', auth, asyncHandler(async (req, res) => {
  const userId = req.params.id;
  
  // Check if user can access these analytics
  if (req.userId !== userId && !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const [
    profileViews,
    postViews,
    connections,
    posts
  ] = await Promise.all([
    // Mock data - implement actual analytics tracking
    Promise.resolve(Math.floor(Math.random() * 1000)),
    Promise.resolve(Math.floor(Math.random() * 5000)),
    User.findById(userId).select('connections').then(user => user?.connections?.length || 0),
    Post.countDocuments({ author: userId })
  ]);

  // Get post engagement over time
  const postEngagement = await Post.aggregate([
    { $match: { author: userId } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        posts: { $sum: 1 },
        likes: { $sum: { $size: '$likes' } },
        comments: { $sum: { $size: '$comments' } }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  res.json({
    success: true,
    data: {
      profileViews,
      postViews,
      connections,
      posts,
      engagement: postEngagement
    }
  });
}));

// Post analytics
router.get('/post/:id', auth, asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author', '_id');
  
  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  // Check if user can access these analytics
  if (post.author._id.toString() !== req.userId && !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const analytics = {
    views: Math.floor(Math.random() * 1000), // Mock data
    likes: post.likes.length,
    comments: post.comments.length,
    shares: post.shares?.length || 0,
    engagement: {
      rate: ((post.likes.length + post.comments.length) / Math.max(1, Math.floor(Math.random() * 1000))) * 100,
      byHour: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        views: Math.floor(Math.random() * 50),
        likes: Math.floor(Math.random() * 10),
        comments: Math.floor(Math.random() * 5)
      }))
    }
  };

  res.json({
    success: true,
    data: analytics
  });
}));

// Job analytics
router.get('/job/:id', auth, asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate('postedBy', '_id');
  
  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found'
    });
  }

  // Check if user can access these analytics
  if (job.postedBy._id.toString() !== req.userId && !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const analytics = {
    views: Math.floor(Math.random() * 500),
    applications: job.applications.length,
    applicationsByStatus: job.applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {}),
    viewsByDay: Array.from({ length: 7 }, (_, i) => ({
      day: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      views: Math.floor(Math.random() * 100),
      applications: Math.floor(Math.random() * 10)
    })).reverse()
  };

  res.json({
    success: true,
    data: analytics
  });
}));

// Platform analytics (admin only)
router.get('/platform', auth, asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const { period = '30d' } = req.query;
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsers,
    activeUsers,
    totalPosts,
    newPosts,
    totalJobs,
    newJobs
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: startDate } }),
    User.countDocuments({ lastActive: { $gte: startDate } }),
    Post.countDocuments(),
    Post.countDocuments({ createdAt: { $gte: startDate } }),
    Job.countDocuments(),
    Job.countDocuments({ createdAt: { $gte: startDate } })
  ]);

  // User growth over time
  const userGrowth = await User.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  // Post engagement
  const postEngagement = await Post.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalPosts: { $sum: 1 },
        totalLikes: { $sum: { $size: '$likes' } },
        totalComments: { $sum: { $size: '$comments' } }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      overview: {
        totalUsers,
        newUsers,
        activeUsers,
        totalPosts,
        newPosts,
        totalJobs,
        newJobs
      },
      userGrowth,
      engagement: postEngagement[0] || {
        totalPosts: 0,
        totalLikes: 0,
        totalComments: 0
      }
    }
  });
}));

export default router;