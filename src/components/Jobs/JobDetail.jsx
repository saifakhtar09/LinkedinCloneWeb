import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Building2, Users, Calendar, ArrowLeft } from 'lucide-react';
import { useSelector } from 'react-redux';
import { jobAPI } from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';
import { toast } from 'react-hot-toast';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    resume: null
  });
  
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await jobAPI.getJob(id);
      setJob(response.data.data);
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await jobAPI.applyForJob(id, applicationData);
      toast.success('Application submitted successfully!');
      setShowApplicationModal(false);
      fetchJob(); // Refresh job data
    } catch (error) {
      console.error('Error applying for job:', error);
      toast.error('Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return 'Salary not specified';
    
    const formatNumber = (num) => {
      if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
      return num.toString();
    };

    if (salary.min && salary.max) {
      return `$${formatNumber(salary.min)} - $${formatNumber(salary.max)}`;
    }
    return salary.min ? `$${formatNumber(salary.min)}+` : `Up to $${formatNumber(salary.max)}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / 86400000);
    
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  const hasApplied = job?.applications?.some(app => app.user === user?.id);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8 animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-300 rounded w-1/2 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            <div className="h-4 bg-gray-300 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Job not found</h2>
        <button
          onClick={() => navigate('/jobs')}
          className="text-blue-600 hover:text-blue-800"
        >
          Back to jobs
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/jobs')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to jobs</span>
      </button>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-8">
          <div className="flex items-start space-x-6">
            <div className="h-16 w-16 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <p className="text-xl text-gray-700 mb-4">{job.companyName}</p>
              
              <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>{job.location}</span>
                  {job.workplaceType === 'remote' && (
                    <span className="text-green-600 font-medium">• Remote</span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span className="capitalize">{job.type}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>{formatSalary(job.salary)}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Posted {formatDate(job.createdAt)}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{job.applicationCount || 0} applicants</span>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  job.isUrgent 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {job.isUrgent ? 'Urgent' : 'Active'}
                </span>
              </div>
              
              <div className="flex space-x-4">
                {hasApplied ? (
                  <button
                    disabled
                    className="px-8 py-3 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed"
                  >
                    Already Applied
                  </button>
                ) : (
                  <button
                    onClick={() => setShowApplicationModal(true)}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Apply Now
                  </button>
                )}
                
                <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
                  Save Job
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
                </div>
              </div>
              
              {job.requirements && job.requirements.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
                  <ul className="space-y-2">
                    {job.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span className="text-gray-700">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {job.responsibilities && job.responsibilities.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Responsibilities</h2>
                  <ul className="space-y-2">
                    {job.responsibilities.map((responsibility, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span className="text-gray-700">{responsibility}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {job.benefits && job.benefits.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Benefits</h2>
                  <ul className="space-y-2">
                    {job.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-green-600 mt-1">•</span>
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Job Details</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Experience Level:</span>
                    <span className="ml-2 capitalize">{job.experienceLevel}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Employment Type:</span>
                    <span className="ml-2 capitalize">{job.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Workplace Type:</span>
                    <span className="ml-2 capitalize">{job.workplaceType}</span>
                  </div>
                  {job.skills && job.skills.length > 0 && (
                    <div>
                      <span className="text-gray-600 block mb-2">Skills:</span>
                      <div className="flex flex-wrap gap-1">
                        {job.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">About the Company</h3>
                <div className="text-sm text-gray-700">
                  <p>Learn more about {job.companyName} and their mission.</p>
                  <button className="text-blue-600 hover:text-blue-800 mt-2">
                    View company page
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      <Modal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        title="Apply for this job"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {job.title} at {job.companyName}
            </h3>
            <p className="text-gray-600">
              Your application will be submitted to the hiring team.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Letter
            </label>
            <textarea
              value={applicationData.coverLetter}
              onChange={(e) => setApplicationData({
                ...applicationData,
                coverLetter: e.target.value
              })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tell the employer why you're a great fit for this role..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resume (Optional)
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setApplicationData({
                ...applicationData,
                resume: e.target.files[0]
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Accepted formats: PDF, DOC, DOCX (max 10MB)
            </p>
          </div>
          
          <div className="flex space-x-4 pt-4">
            <button
              onClick={handleApply}
              disabled={applying || !applicationData.coverLetter.trim()}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {applying ? <LoadingSpinner size="sm" color="white" /> : 'Submit Application'}
            </button>
            <button
              onClick={() => setShowApplicationModal(false)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default JobDetail;