import Joi from 'joi';

// User validation schemas
export const userRegistrationSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required().trim(),
  lastName: Joi.string().min(2).max(50).required().trim(),
  email: Joi.string().email().required().lowercase().trim(),
  password: Joi.string().min(8).max(128).required()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])'))
    .message('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    .messages({ 'any.only': 'Passwords do not match' })
});

export const userLoginSchema = Joi.object({
  email: Joi.string().email().required().lowercase().trim(),
  password: Joi.string().required()
});

export const userUpdateSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).trim(),
  lastName: Joi.string().min(2).max(50).trim(),
  headline: Joi.string().max(120).trim().allow(''),
  summary: Joi.string().max(2000).trim().allow(''),
  location: Joi.string().max(100).trim().allow(''),
  industry: Joi.string().max(100).trim().allow(''),
  skills: Joi.array().items(Joi.string().max(50).trim()),
  experience: Joi.array().items(Joi.object({
    title: Joi.string().max(100).required(),
    company: Joi.string().max(100).required(),
    location: Joi.string().max(100),
    startDate: Joi.date().required(),
    endDate: Joi.date().when('current', { is: false, then: Joi.required() }),
    current: Joi.boolean().default(false),
    description: Joi.string().max(2000).allow('')
  })),
  education: Joi.array().items(Joi.object({
    school: Joi.string().max(100).required(),
    degree: Joi.string().max(100).required(),
    field: Joi.string().max(100),
    startDate: Joi.date().required(),
    endDate: Joi.date(),
    description: Joi.string().max(1000).allow('')
  }))
});

// Post validation schemas
export const postCreateSchema = Joi.object({
  content: Joi.string().min(1).max(3000).required().trim(),
  type: Joi.string().valid('text', 'image', 'video', 'article').default('text')
});

export const commentCreateSchema = Joi.object({
  content: Joi.string().min(1).max(1000).required().trim()
});

// Job validation schemas
export const jobCreateSchema = Joi.object({
  title: Joi.string().min(5).max(100).required().trim(),
  company: Joi.string().required(),
  location: Joi.string().max(100).required().trim(),
  type: Joi.string().valid('full-time', 'part-time', 'contract', 'internship').required(),
  remote: Joi.boolean().default(false),
  salary: Joi.object({
    min: Joi.number().min(0),
    max: Joi.number().min(Joi.ref('min')),
    currency: Joi.string().length(3).default('USD')
  }),
  description: Joi.string().min(50).max(5000).required().trim(),
  requirements: Joi.array().items(Joi.string().max(200).trim()),
  benefits: Joi.array().items(Joi.string().max(200).trim())
});

// Company validation schemas
export const companyCreateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().trim(),
  description: Joi.string().max(2000).trim().allow(''),
  industry: Joi.string().max(100).trim().allow(''),
  size: Joi.string().valid('1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001-10000', '10000+'),
  founded: Joi.number().min(1800).max(new Date().getFullYear()),
  headquarters: Joi.string().max(100).trim().allow(''),
  website: Joi.string().uri().allow('')
});

// Message validation schemas
export const messageCreateSchema = Joi.object({
  receiver: Joi.string().required(),
  content: Joi.string().min(1).max(1000).required().trim()
});

// Validation middleware
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    req.body = value;
    next();
  };
};