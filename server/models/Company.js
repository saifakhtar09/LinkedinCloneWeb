import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  logo: {
    url: String,
    publicId: String
  },
  coverImage: {
    url: String,
    publicId: String
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  industry: {
    type: String,
    maxlength: [100, 'Industry cannot exceed 100 characters']
  },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001-10000', '10000+'],
    default: '1-10'
  },
  founded: {
    type: Number,
    min: [1800, 'Founded year cannot be before 1800'],
    max: [new Date().getFullYear(), 'Founded year cannot be in the future']
  },
  headquarters: {
    type: String,
    maxlength: [100, 'Headquarters cannot exceed 100 characters']
  },
  website: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Website must be a valid URL'
    }
  },
  specialties: [{
    type: String,
    maxlength: [50, 'Specialty cannot exceed 50 characters']
  }],
  employees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    position: {
      type: String,
      maxlength: [100, 'Position cannot exceed 100 characters']
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date,
    current: {
      type: Boolean,
      default: true
    }
  }],
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    followedAt: {
      type: Date,
      default: Date.now
    }
  }],
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  jobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  socialLinks: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String
  },
  contactInfo: {
    email: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: 'Please enter a valid email'
      }
    },
    phone: String,
    address: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
companySchema.index({ name: 'text', description: 'text' });
companySchema.index({ industry: 1 });
companySchema.index({ size: 1 });
companySchema.index({ headquarters: 1 });
companySchema.index({ slug: 1 });
companySchema.index({ isActive: 1, isVerified: 1 });

// Virtual for follower count
companySchema.virtual('followerCount').get(function() {
  return this.followers.length;
});

// Virtual for employee count
companySchema.virtual('employeeCount').get(function() {
  return this.employees.filter(emp => emp.current).length;
});

// Virtual for job count
companySchema.virtual('jobCount').get(function() {
  return this.jobs.length;
});

// Pre-save middleware to generate slug
companySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Method to check if user follows company
companySchema.methods.isFollowedBy = function(userId) {
  return this.followers.some(follower => follower.user.toString() === userId.toString());
};

// Method to add follower
companySchema.methods.addFollower = function(userId) {
  if (!this.isFollowedBy(userId)) {
    this.followers.push({ user: userId });
    return this.save();
  }
  return this;
};

// Method to remove follower
companySchema.methods.removeFollower = function(userId) {
  this.followers = this.followers.filter(follower => follower.user.toString() !== userId.toString());
  return this.save();
};

// Method to check if user is admin
companySchema.methods.isAdmin = function(userId) {
  return this.admins.some(admin => admin.toString() === userId.toString());
};

export default mongoose.model('Company', companySchema);