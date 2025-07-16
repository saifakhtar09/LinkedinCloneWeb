import express from 'express';
import multer from 'multer';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { auth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/posts/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'), false);
    }
  }
});

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', auth, upload.array('media', 5), async (req, res) => {
  try {
    const { content, type = 'text', privacy = 'public' } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Post content is required'
      });
    }

    const postData = {
      author: req.userId,
      content: content.trim(),
      type,
      privacy
    };

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      const images = [];
      let video = null;

      req.files.forEach(file => {
        const fileUrl = `/uploads/posts/${file.filename}`;
        
        if (file.mimetype.startsWith('image/')) {
          images.push({
            url: fileUrl,
            publicId: file.filename
          });
        } else if (file.mimetype.startsWith('video/')) {
          video = {
            url: fileUrl,
            publicId: file.filename
          };
        }
      });

      if (images.length > 0) {
        postData.images = images;
        postData.type = 'image';
      }

      if (video) {
        postData.video = video;
        postData.type = 'video';
      }
    }

    const post = new Post(postData);
    await post.save();

    // Populate the post with author details
    await post.populate('author', 'firstName lastName profilePicture headline');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/posts
// @desc    Get posts feed
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, author } = req.query;
    
    const query = { isActive: true };
    
    // Filter by type if specified
    if (type && ['text', 'image', 'video', 'article'].includes(type)) {
      query.type = type;
    }

    // Filter by author if specified
    if (author) {
      query.author = author;
    }

    // If user is authenticated, show posts from connections and public posts
    if (req.userId) {
      const user = await User.findById(req.userId);
      const connectionIds = user.connections
        .filter(conn => conn.status === 'accepted')
        .map(conn => conn.user);
      
      query.$or = [
        { privacy: 'public' },
        { author: req.userId },
        { author: { $in: connectionIds }, privacy: 'connections' }
      ];
    } else {
      // For non-authenticated users, only show public posts
      query.privacy = 'public';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'firstName lastName profilePicture headline')
        .populate('likes.user', 'firstName lastName profilePicture')
        .populate('comments.user', 'firstName lastName profilePicture')
        .populate('shares.user', 'firstName lastName profilePicture')
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
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/posts/:id
// @desc    Get single post
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'firstName lastName profilePicture headline')
      .populate('likes.user', 'firstName lastName profilePicture')
      .populate('comments.user', 'firstName lastName profilePicture')
      .populate('shares.user', 'firstName lastName profilePicture');

    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check privacy settings
    if (post.privacy === 'private' && (!req.userId || post.author._id.toString() !== req.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (post.privacy === 'connections' && req.userId) {
      const user = await User.findById(req.userId);
      const isConnection = user.connections.some(
        conn => conn.user.toString() === post.author._id.toString() && conn.status === 'accepted'
      );
      
      if (!isConnection && post.author._id.toString() !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Increment view count
    post.views += 1;
    await post.save();

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like/Unlike a post
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const existingLike = post.likes.find(like => like.user.toString() === req.userId);
    
    if (existingLike) {
      // Unlike the post
      post.likes = post.likes.filter(like => like.user.toString() !== req.userId);
    } else {
      // Like the post
      post.likes.push({ user: req.userId });
    }

    await post.save();

    // Populate the updated post
    await post.populate('author', 'firstName lastName profilePicture headline');
    await post.populate('likes.user', 'firstName lastName profilePicture');
    await post.populate('comments.user', 'firstName lastName profilePicture');

    res.json({
      success: true,
      message: existingLike ? 'Post unliked' : 'Post liked',
      data: post
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/posts/:id/comment
// @desc    Add comment to post
// @access  Private
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const post = await Post.findById(req.params.id);
    
    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.comments.push({
      user: req.userId,
      content: content.trim()
    });

    await post.save();

    // Populate the updated post
    await post.populate('author', 'firstName lastName profilePicture headline');
    await post.populate('likes.user', 'firstName lastName profilePicture');
    await post.populate('comments.user', 'firstName lastName profilePicture');

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: post
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/posts/:id/share
// @desc    Share a post
// @access  Private
router.post('/:id/share', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const existingShare = post.shares.find(share => share.user.toString() === req.userId);
    
    if (existingShare) {
      return res.status(400).json({
        success: false,
        message: 'Post already shared'
      });
    }

    post.shares.push({ user: req.userId });
    await post.save();

    // Populate the updated post
    await post.populate('author', 'firstName lastName profilePicture headline');
    await post.populate('shares.user', 'firstName lastName profilePicture');

    res.json({
      success: true,
      message: 'Post shared successfully',
      data: post
    });
  } catch (error) {
    console.error('Share post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update post
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { content, privacy } = req.body;

    const post = await Post.findById(req.params.id);
    
    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is the author
    if (post.author.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    if (content) post.content = content.trim();
    if (privacy) post.privacy = privacy;

    await post.save();

    // Populate the updated post
    await post.populate('author', 'firstName lastName profilePicture headline');
    await post.populate('likes.user', 'firstName lastName profilePicture');
    await post.populate('comments.user', 'firstName lastName profilePicture');

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: post
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is the author or admin
    if (post.author.toString() !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    // Soft delete
    post.isActive = false;
    await post.save();

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/posts/:postId/comment/:commentId
// @desc    Delete comment
// @access  Private
router.delete('/:postId/comment/:commentId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    
    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = post.comments.id(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is the comment author, post author, or admin
    if (comment.user.toString() !== req.userId && 
        post.author.toString() !== req.userId && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    comment.remove();
    await post.save();

    // Populate the updated post
    await post.populate('author', 'firstName lastName profilePicture headline');
    await post.populate('comments.user', 'firstName lastName profilePicture');

    res.json({
      success: true,
      message: 'Comment deleted successfully',
      data: post
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;