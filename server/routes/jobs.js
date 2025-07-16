import express from 'express';
import Job from '../models/Job.js';
import { auth } from '../middleware/auth.js';
import { fetchAdzunaJobs } from '../utils/adzunaApi.js';

const router = express.Router();

// ------------------ FETCH ADZUNA JOBS ------------------
// ✅ This must come before "/:id"
router.get('/adzuna', async (req, res) => {
  const { search = '', location = '' } = req.query;

  try {
    const jobs = await fetchAdzunaJobs(search, location);
    res.json(jobs);
  } catch (error) {
    console.error('Failed to fetch Adzuna jobs:', error.message);
    res.status(500).json({ message: 'Adzuna API error', error: error.message });
  }
});

// ------------------ CREATE A JOB ------------------
router.post('/', auth, async (req, res) => {
  try {
    const job = new Job({
      ...req.body,
      postedBy: req.userId
    });

    await job.save();

    const populatedJob = await Job.findById(job._id)
      .populate('company', 'name logo')
      .populate('postedBy', 'firstName lastName profilePicture');

    res.status(201).json(populatedJob);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ------------------ GET ALL JOBS ------------------
router.get('/', async (req, res) => {
  try {
    const { location, type, remote, search } = req.query;
    const query = { status: 'active' };

    if (location) query.location = { $regex: location, $options: 'i' };
    if (type) query.type = type;
    if (remote === 'true') query.remote = true;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const jobs = await Job.find(query)
      .populate('company', 'name logo')
      .populate('postedBy', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ------------------ GET JOB BY ID ------------------
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'name logo description')
      .populate('postedBy', 'firstName lastName profilePicture');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ------------------ APPLY FOR A JOB ------------------
router.post('/:id/apply', auth, async (req, res) => {
  try {
    const { coverLetter } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const existingApplication = job.applications.find(
      app => app.user.toString() === req.userId
    );

    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied for this job' });
    }

    job.applications.push({
      user: req.userId,
      coverLetter
    });

    await job.save();
    res.json({ message: 'Application submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
