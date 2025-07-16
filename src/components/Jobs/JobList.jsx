// import React, { useState, useEffect } from "react";
// import { Search, MapPin, Clock, DollarSign, Building2, AlertCircle, Loader2 } from "lucide-react";
// // This file goes in: src/components/Jobs/JobList.js
// // Import path depends on your folder structure
// import { fetchAdzunaJobs, testBackendConnection } from "../../utils/adzunaApi";

// const JobList = () => {
//   const [jobs, setJobs] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [location, setLocation] = useState('');
//   const [backendStatus, setBackendStatus] = useState(null);

//   // Test backend connection on component mount
//   useEffect(() => {
//     const checkBackend = async () => {
//       const isConnected = await testBackendConnection();
//       setBackendStatus(isConnected);
//     };
//     checkBackend();
//   }, []);

//   // Load default jobs on component mount
//   useEffect(() => {
//     if (backendStatus === true) {
//       handleSearch('software developer', 'Mumbai');
//     }
//   }, [backendStatus]);

//   const handleSearch = async (query = searchQuery, loc = location) => {
//     if (!backendStatus) {
//       setError('Backend server is not running. Please start the server first.');
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const response = await fetchAdzunaJobs(query, loc, 1);
//       setJobs(response.jobs || []);
      
//       if (response.jobs.length === 0) {
//         setError('No jobs found. Try different search terms.');
//       }
//     } catch (err) {
//       setError(err.message || 'Failed to fetch jobs');
//       setJobs([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     handleSearch();
//   };

//   const formatSalary = (job) => {
//     if (job.salary_min && job.salary_max) {
//       return `₹${job.salary_min.toLocaleString()} - ₹${job.salary_max.toLocaleString()}`;
//     }
//     return 'Salary not specified';
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'Date not specified';
//     return new Date(dateString).toLocaleDateString('en-IN');
//   };

//   const truncateDescription = (description, maxLength = 200) => {
//     if (!description) return 'No description available';
//     return description.length > maxLength 
//       ? description.substring(0, maxLength) + '...'
//       : description;
//   };

//   return (
//     <div className="max-w-6xl mx-auto p-6">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Search</h1>
//         <p className="text-gray-600">Find your next opportunity</p>
//       </div>

//       {/* Backend Status Indicator */}
//       <div className="mb-4">
//         <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
//           backendStatus === true 
//             ? 'bg-green-100 text-green-800' 
//             : backendStatus === false 
//               ? 'bg-red-100 text-red-800'
//               : 'bg-yellow-100 text-yellow-800'
//         }`}>
//           <div className={`w-2 h-2 rounded-full mr-2 ${
//             backendStatus === true 
//               ? 'bg-green-500' 
//               : backendStatus === false 
//                 ? 'bg-red-500'
//                 : 'bg-yellow-500'
//           }`}></div>
//           {backendStatus === true ? 'Backend Connected' : 
//            backendStatus === false ? 'Backend Disconnected' : 'Checking Backend...'}
//         </div>
//       </div>

//       {/* Search Form */}
//       <form onSubmit={handleSubmit} className="mb-8">
//         <div className="flex gap-4 mb-4">
//           <div className="flex-1">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Job Title
//             </label>
//             <input
//               type="text"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               placeholder="e.g., Software Developer"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>
//           <div className="flex-1">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Location
//             </label>
//             <input
//               type="text"
//               value={location}
//               onChange={(e) => setLocation(e.target.value)}
//               placeholder="e.g., Mumbai, Delhi"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>
//         </div>
//         <button
//           type="submit"
//           disabled={loading || !backendStatus}
//           className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           <Search className="w-5 h-5 mr-2" />
//           {loading ? 'Searching...' : 'Search Jobs'}
//         </button>
//       </form>

//       {/* Loading State */}
//       {loading && (
//         <div className="flex justify-center items-center py-12">
//           <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
//           <span className="ml-2 text-gray-600">Searching for jobs...</span>
//         </div>
//       )}

//       {/* Error State */}
//       {error && (
//         <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
//           <div className="flex items-center">
//             <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
//             <span className="text-red-700">{error}</span>
//           </div>
//         </div>
//       )}

//       {/* Jobs List */}
//       <div className="space-y-6">
//         {jobs.map((job, index) => (
//           <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
//             <div className="flex justify-between items-start mb-4">
//               <div className="flex-1">
//                 <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                   {job.title || 'Job Title Not Available'}
//                 </h3>
//                 <div className="flex items-center text-gray-600 mb-2">
//                   <Building2 className="w-4 h-4 mr-2" />
//                   <span>{job.company?.display_name || 'Company not specified'}</span>
//                 </div>
//                 <div className="flex items-center text-gray-600 mb-2">
//                   <MapPin className="w-4 h-4 mr-2" />
//                   <span>{job.location?.display_name || 'Location not specified'}</span>
//                 </div>
//                 <div className="flex items-center text-gray-600 mb-2">
//                   <DollarSign className="w-4 h-4 mr-2" />
//                   <span>{formatSalary(job)}</span>
//                 </div>
//                 <div className="flex items-center text-gray-600">
//                   <Clock className="w-4 h-4 mr-2" />
//                   <span>Posted: {formatDate(job.created)}</span>
//                 </div>
//               </div>
//             </div>
            
//             <div className="mb-4">
//               <p className="text-gray-700">
//                 {truncateDescription(job.description)}
//               </p>
//             </div>
            
//             <div className="flex justify-between items-center">
//               <div className="flex space-x-2">
//                 {job.contract_type && (
//                   <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
//                     {job.contract_type}
//                   </span>
//                 )}
//                 {job.category?.label && (
//                   <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
//                     {job.category.label}
//                   </span>
//                 )}
//               </div>
              
//               {job.redirect_url && (
//                 <a
//                   href={job.redirect_url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
//                 >
//                   Apply Now
//                 </a>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* No Jobs Message */}
//       {!loading && !error && jobs.length === 0 && (
//         <div className="text-center py-12">
//           <p className="text-gray-600 text-lg">No jobs found. Try searching for different terms.</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default JobList;




// Alternative JobList.js with mock data (for testing)
import React, { useState, useEffect } from "react";
import { Search, MapPin, Clock, DollarSign, Building2 } from "lucide-react";

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    type: '',
    remote: false
  });

  // Mock data for testing
  const mockJobs = [
    {
      id: 1,
      title: "Software Engineer",
      company: { display_name: "Tech Corp" },
      location: { display_name: "Mumbai, Maharashtra" },
      contract_time: "Full-time",
      salary_min: 600000,
      salary_max: 1200000,
      description: "We are looking for a skilled software engineer to join our team...",
      created: "2024-01-10T10:00:00Z",
      redirect_url: "https://example.com/apply"
    },
    {
      id: 2,
      title: "Frontend Developer",
      company: { display_name: "Digital Solutions" },
      location: { display_name: "Delhi, Delhi" },
      contract_time: "Full-time",
      salary_min: 500000,
      salary_max: 900000,
      description: "Join our frontend team to build amazing user experiences...",
      created: "2024-01-09T14:30:00Z",
      redirect_url: "https://example.com/apply"
    },
    {
      id: 3,
      title: "Data Scientist",
      company: { display_name: "Analytics Inc" },
      location: { display_name: "Bangalore, Karnataka" },
      contract_time: "Full-time",
      salary_min: 800000,
      salary_max: 1500000,
      description: "We need a data scientist to analyze large datasets...",
      created: "2024-01-08T09:15:00Z",
      redirect_url: "https://example.com/apply"
    }
  ];

  useEffect(() => {
    fetchJobs();
  }, [filters.search, filters.location]);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter mock jobs based on search criteria
      let filteredJobs = mockJobs;
      
      if (filters.search) {
        filteredJobs = filteredJobs.filter(job => 
          job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          job.company.display_name.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      if (filters.location) {
        filteredJobs = filteredJobs.filter(job => 
          job.location.display_name.toLowerCase().includes(filters.location.toLowerCase())
        );
      }
      
      setJobs(filteredJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to fetch jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const formatSalary = (salary_min, salary_max) => {
    if (!salary_min && !salary_max) return 'Salary not specified';

    const format = (num) => (num >= 100000 ? `${(num / 100000).toFixed(1)}L` : `${(num / 1000).toFixed(0)}k`);

    if (salary_min && salary_max) return `₹${format(salary_min)} - ₹${format(salary_max)}`;
    return salary_min ? `₹${format(salary_min)}+` : `Up to ₹${format(salary_max)}`;
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Find Your Next Job</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Job title or keyword"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Location (e.g., Mumbai, Delhi)"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.remote}
                onChange={(e) => handleFilterChange('remote', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Remote only</span>
            </label>
          </div>
          
          <div className="mt-4">
            <button
              onClick={fetchJobs}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search Jobs
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Job Results */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-gray-600">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2">Loading jobs...</p>
          </div>
        ) : jobs.length > 0 ? (
          jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 bg-blue-100 rounded flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                  <p className="text-gray-600 mb-2">{job.company?.display_name || 'Unknown Company'}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location?.display_name || 'Location not specified'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{job.contract_time || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Posted {formatDate(job.created)}
                    </span>
                    <a
                      href={job.redirect_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Apply Now
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">Try adjusting your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobList;