import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    maxlength: [100, 'Job title cannot exceed 100 characters'],
    trim: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Job location is required'],
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  type: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
    required: [true, 'Job type is required']
  },
  workplaceType: {
    type: String,
    enum: ['on-site', 'remote', 'hybrid'],
    default: 'on-site'
  },
  experienceLevel: {
    type: String,
    enum: ['internship', 'entry-level', 'associate', 'mid-senior', 'director', 'executive'],
    required: [true, 'Experience level is required']
  },
  salary: {
    min: {
      type: Number,
      min: [0, 'Minimum salary cannot be negative']
    },
    max: {
      type: Number,
      min: [0, 'Maximum salary cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD',
      maxlength: [3, 'Currency code cannot exceed 3 characters']
    },
    period: {
      type: String,
      enum: ['hourly', 'monthly', 'yearly'],
      default: 'yearly'
    }
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  requirements: [{
    type: String,
    maxlength: [200, 'Requirement cannot exceed 200 characters']
  }],
  responsibilities: [{
    type: String,
    maxlength: [200, 'Responsibility cannot exceed 200 characters']
  }],
  benefits: [{
    type: String,
    maxlength: [200, 'Benefit cannot exceed 200 characters']
  }],
  skills: [{
    type: String,
    maxlength: [50, 'Skill cannot exceed 50 characters']
  }],
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Job poster is required']
  },
  applications: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    coverLetter: {
      type: String,
      maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
    },
    resume: {
      url: String,
      publicId: String
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'interviewed', 'accepted', 'rejected'],
      default: 'pending'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    }
  }],
  status: {
    type: String,
    enum: ['active', 'closed', 'draft', 'paused'],
    default: 'active'
  },
  views: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
jobSchema.index({ title: 'text', description: 'text', companyName: 'text' });
jobSchema.index({ location: 1 });
jobSchema.index({ type: 1 });
jobSchema.index({ workplaceType: 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ expiresAt: 1 });

// Virtual for application count
jobSchema.virtual('applicationCount').get(function() {
  return this.applications.length;
});

// Virtual for days since posted
jobSchema.virtual('daysSincePosted').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to check if user has applied
jobSchema.methods.hasUserApplied = function(userId) {
  return this.applications.some(app => app.user.toString() === userId.toString());
};

// Method to add application
jobSchema.methods.addApplication = function(applicationData) {
  if (!this.hasUserApplied(applicationData.user)) {
    this.applications.push(applicationData);
    return this.save();
  }
  throw new Error('User has already applied for this job');
};

// Method to update application status
jobSchema.methods.updateApplicationStatus = function(userId, status, notes = '') {
  const application = this.applications.find(app => app.user.toString() === userId.toString());
  if (application) {
    application.status = status;
    if (notes) application.notes = notes;
    return this.save();
  }
  throw new Error('Application not found');
};

export default mongoose.model('Job', jobSchema);