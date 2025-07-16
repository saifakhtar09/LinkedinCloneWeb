import express from 'express';
import Company from '../models/Company.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Create company
router.post('/', auth, async (req, res) => {
  try {
    const company = new Company({
      ...req.body,
      admins: [req.userId]
    });

    await company.save();
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all companies
router.get('/', async (req, res) => {
  try {
    const companies = await Company.find()
      .populate('admins', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 });

    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get company by ID
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate('admins', 'firstName lastName profilePicture')
      .populate('employees.user', 'firstName lastName profilePicture');

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Follow company
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const isFollowing = company.followers.includes(req.userId);
    
    if (isFollowing) {
      company.followers = company.followers.filter(
        follower => follower.toString() !== req.userId
      );
    } else {
      company.followers.push(req.userId);
    }

    await company.save();
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;