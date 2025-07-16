import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { generateUniqueFilename } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Create upload directories
const uploadDirs = {
  profiles: 'uploads/profiles',
  posts: 'uploads/posts',
  companies: 'uploads/companies',
  documents: 'uploads/documents'
};

Object.values(uploadDirs).forEach(ensureDirectoryExists);

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = uploadDirs.posts; // default
    
    if (req.route.path.includes('profile-picture') || req.route.path.includes('cover-photo')) {
      uploadPath = uploadDirs.profiles;
    } else if (req.route.path.includes('company')) {
      uploadPath = uploadDirs.companies;
    } else if (req.route.path.includes('resume') || req.route.path.includes('document')) {
      uploadPath = uploadDirs.documents;
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = generateUniqueFilename(file.originalname);
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|avi|mov|wmv|flv|webm/;
  const allowedDocumentTypes = /pdf|doc|docx|txt/;
  
  const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase()) ||
                  allowedVideoTypes.test(path.extname(file.originalname).toLowerCase()) ||
                  allowedDocumentTypes.test(path.extname(file.originalname).toLowerCase());
  
  const mimetype = file.mimetype.startsWith('image/') ||
                   file.mimetype.startsWith('video/') ||
                   file.mimetype.startsWith('application/');
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, and documents are allowed.'));
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  }
});

// Specific upload configurations
export const uploadProfilePicture = upload.single('profilePicture');
export const uploadCoverPhoto = upload.single('coverPhoto');
export const uploadPostMedia = upload.array('media', 5);
export const uploadCompanyLogo = upload.single('logo');
export const uploadDocument = upload.single('document');
export const uploadMultiple = upload.array('files', 10);

// Error handling middleware for multer
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    logger.error('Multer error:', err);
    
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 10MB.'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum is 5 files.'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field.'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'File upload error.'
        });
    }
  } else if (err) {
    logger.error('Upload error:', err);
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload failed.'
    });
  }
  
  next();
};

// Clean up old files
export const cleanupOldFiles = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) {
        logger.error('Error deleting old file:', err);
      } else {
        logger.info('Old file deleted successfully:', filePath);
      }
    });
  }
};